import "server-only";

/**
 * Runs HR+ outside Cloudflare (Vercel, `next start`, any Node 22+ host) by
 * providing objects shaped like the Worker bindings the app already uses:
 *
 * - `DB`: Cloudflare D1 over its REST API when CLOUDFLARE_ACCOUNT_ID and
 *   CLOUDFLARE_API_TOKEN are set (the same database the Worker uses, so both
 *   deployments share data); otherwise a SQLite file via Node's built-in
 *   `node:sqlite`, which needs no setup but is per-instance on serverless hosts.
 * - `AI`: Workers AI over its REST API with the same credentials, or absent,
 *   in which case every AI feature uses its rule-based fallback.
 *
 * Only the D1 surface that drizzle-orm/d1 and src/db use is implemented:
 * prepare, bind, all, first, run, raw, batch and exec.
 */

type Value = string | number | bigint | null | Uint8Array;
type Meta = { changes: number; last_row_id: number; duration: number; changed_db: boolean; size_after: number; rows_read: number; rows_written: number };
type Result<T = Record<string, unknown>> = { results: T[]; success: true; meta: Meta };

const emptyMeta = (changes = 0, lastRowId = 0): Meta => ({
  changes,
  last_row_id: lastRowId,
  duration: 0,
  changed_db: changes > 0,
  size_after: 0,
  rows_read: 0,
  rows_written: changes,
});

function toValue(v: unknown): Value {
  if (v === undefined || v === null) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number" || typeof v === "string" || typeof v === "bigint" || v instanceof Uint8Array) return v;
  if (v instanceof Date) return v.toISOString();
  return JSON.stringify(v);
}

const isReader = (sql: string) => /^\s*(select|with|pragma|explain|values)\b/i.test(sql) || /\breturning\b/i.test(sql);

/* ---------------- Statement ---------------- */

interface Engine {
  query(sql: string, params: Value[]): Promise<{ columns: string[]; rows: unknown[][]; meta: Meta }>;
  batch(items: { sql: string; params: Value[] }[]): Promise<{ columns: string[]; rows: unknown[][]; meta: Meta }[]>;
  exec(sql: string): Promise<void>;
}

class Statement {
  constructor(
    private engine: Engine,
    readonly sql: string,
    readonly params: Value[] = [],
  ) {}

  bind(...values: unknown[]) {
    return new Statement(this.engine, this.sql, values.map(toValue));
  }

  private static objects(columns: string[], rows: unknown[][]) {
    return rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i]])));
  }

  async all<T = Record<string, unknown>>(): Promise<Result<T>> {
    const r = await this.engine.query(this.sql, this.params);
    return { results: Statement.objects(r.columns, r.rows) as T[], success: true, meta: r.meta };
  }

  async first<T = Record<string, unknown>>(column?: string): Promise<T | null> {
    const { results } = await this.all<Record<string, unknown>>();
    const row = results[0];
    if (!row) return null;
    return (column ? row[column] : row) as T;
  }

  async run(): Promise<Result> {
    return this.all();
  }

  async raw<T = unknown[]>(opts?: { columnNames?: boolean }): Promise<T[]> {
    const r = await this.engine.query(this.sql, this.params);
    return (opts?.columnNames ? [r.columns, ...r.rows] : r.rows) as T[];
  }
}

class Database {
  constructor(private engine: Engine) {}

  prepare(sql: string) {
    return new Statement(this.engine, sql);
  }

  async batch(statements: Statement[]): Promise<Result[]> {
    const out = await this.engine.batch(statements.map((s) => ({ sql: s.sql, params: s.params })));
    return out.map((r) => ({ results: r.rows.map((row) => Object.fromEntries(r.columns.map((c, i) => [c, row[i]]))), success: true, meta: r.meta }));
  }

  async exec(sql: string) {
    await this.engine.exec(sql);
    return { count: 1, duration: 0 };
  }

  dump(): Promise<ArrayBuffer> {
    throw new Error("dump() is not supported outside Cloudflare");
  }

  withSession() {
    return this;
  }
}

/* ---------------- Engines ---------------- */

type SqliteStmt = {
  columns(): { name: string }[];
  all(...p: Value[]): Record<string, unknown>[];
  run(...p: Value[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  setReturnArrays(on: boolean): void;
};
type SqliteDb = { exec(sql: string): void; prepare(sql: string): SqliteStmt };

/** SQLite file through Node's built-in driver (Node 22.5+). */
function sqliteEngine(path: string): Engine {
  // getBuiltinModule keeps bundlers (and the Cloudflare build) from ever touching node:sqlite.
  const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as { DatabaseSync: new (p: string) => SqliteDb };
  const fs = process.getBuiltinModule("node:fs") as typeof import("node:fs");
  const dir = path.slice(0, path.lastIndexOf("/"));
  if (dir) fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");

  const one = (sql: string, params: Value[]) => {
    const stmt = db.prepare(sql);
    const columns = stmt.columns().map((c) => c.name);
    if (columns.length || isReader(sql)) {
      // Positional rows, like D1's raw(): joins often repeat column names such as "id".
      stmt.setReturnArrays(true);
      const rows = stmt.all(...params) as unknown as unknown[][];
      return { columns, rows, meta: emptyMeta() };
    }
    const r = stmt.run(...params);
    return { columns: [], rows: [], meta: emptyMeta(Number(r.changes), Number(r.lastInsertRowid)) };
  };

  return {
    async query(sql, params) {
      return one(sql, params);
    },
    async batch(items) {
      db.exec("BEGIN");
      try {
        const out = items.map((i) => one(i.sql, i.params));
        db.exec("COMMIT");
        return out;
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
    },
    async exec(sql) {
      db.exec(sql);
    },
  };
}

type RawResult = { results?: { columns?: string[]; rows?: unknown[][] }; meta?: Partial<Meta> };

/** Cloudflare D1 through the REST API's /raw endpoint (columns + rows). */
function d1HttpEngine(accountId: string, token: string, databaseId: string): Engine {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/raw`;
  const call = async (body: unknown): Promise<RawResult[]> => {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as { success?: boolean; result?: RawResult[]; errors?: { message: string }[] } | null;
    if (!res.ok || !json?.success) throw new Error(`D1 HTTP ${res.status}: ${json?.errors?.map((e) => e.message).join("; ") || res.statusText}`);
    return json.result ?? [];
  };
  const map = (r: RawResult) => ({
    columns: r.results?.columns ?? [],
    rows: r.results?.rows ?? [],
    meta: emptyMeta(r.meta?.changes ?? 0, r.meta?.last_row_id ?? 0),
  });
  const wire = (params: Value[]) => params.map((p) => (typeof p === "bigint" ? Number(p) : p instanceof Uint8Array ? Array.from(p) : p));
  return {
    async query(sql, params) {
      const [r] = await call({ sql, params: wire(params) });
      return map(r ?? {});
    },
    async batch(items) {
      if (!items.length) return [];
      const rs = await call({ batch: items.map((i) => ({ sql: i.sql, params: wire(i.params) })) });
      return rs.map(map);
    },
    async exec(sql) {
      await call({ sql });
    },
  };
}

/** Workers AI over REST; same input/output shape as the binding's `run`. */
function workersAiHttp(accountId: string, token: string) {
  return {
    async run(model: string, input: unknown) {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(25_000),
      });
      const json = (await res.json().catch(() => null)) as { success?: boolean; result?: unknown; errors?: { message: string }[] } | null;
      if (!res.ok || !json?.success) throw new Error(`Workers AI HTTP ${res.status}: ${json?.errors?.map((e) => e.message).join("; ") || res.statusText}`);
      return json.result;
    },
  };
}

/* ---------------- Env ---------------- */

/** True when not running inside the Cloudflare Worker. */
export function isNodeRuntime() {
  return process.env.HRP_RUNTIME === "node" || process.env.VERCEL === "1";
}

// The D1 database the Worker is bound to (wrangler.jsonc); override with D1_DATABASE_ID.
const DEFAULT_D1_ID = "e5024672-fb35-4343-8e1a-3feb2624636d";

let cached: CloudflareEnv | null = null;

export function nodeEnv(): CloudflareEnv {
  if (cached) return cached;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const remote = Boolean(account && token);
  const engine = remote
    ? d1HttpEngine(account!, token!, process.env.D1_DATABASE_ID || DEFAULT_D1_ID)
    : sqliteEngine(process.env.HRP_SQLITE_PATH || (process.env.VERCEL ? "/tmp/hr-plus.sqlite" : ".data/hr-plus.sqlite"));
  cached = {
    DB: new Database(engine) as unknown as D1Database,
    AI: (remote && process.env.HRP_AI !== "off" ? workersAiHttp(account!, token!) : undefined) as unknown as Ai,
    DEMO_MODE: process.env.DEMO_MODE ?? "true",
  } as CloudflareEnv;
  return cached;
}
