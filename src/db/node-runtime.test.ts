import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type Call = { url: string; body: unknown };

async function freshEnv(vars: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  const mod = await import("./node-runtime");
  return mod.nodeEnv();
}

describe("node runtime: D1 and Workers AI over REST", () => {
  const calls: Call[] = [];
  beforeEach(() => {
    calls.length = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        const body = JSON.parse(String(init.body));
        calls.push({ url, body });
        if (url.includes("/ai/run/")) return Response.json({ success: true, result: { response: "Hello" } });
        const one = (sql: string) =>
          /select/i.test(sql)
            ? { results: { columns: ["id", "name", "id"], rows: [["a", "Asha", "d1"]] }, meta: { changes: 0, last_row_id: 0 } }
            : { results: { columns: [], rows: [] }, meta: { changes: 1, last_row_id: 7 } };
        const result = body.batch ? body.batch.map((b: { sql: string }) => one(b.sql)) : [one(body.sql)];
        return Response.json({ success: true, result });
      }),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("maps D1 reads, raw rows, writes and batches", async () => {
    const env = await freshEnv({ CLOUDFLARE_ACCOUNT_ID: "acct", CLOUDFLARE_API_TOKEN: "tok", D1_DATABASE_ID: "dbid", VERCEL: "1" });
    const db = env.DB;

    const raw = await db.prepare("select e.id, e.name, d.id from employees e join departments d").bind(true, undefined).raw();
    expect(raw).toEqual([["a", "Asha", "d1"]]);
    expect(calls[0]!.url).toBe("https://api.cloudflare.com/client/v4/accounts/acct/d1/database/dbid/raw");
    expect(calls[0]!.body).toEqual({ sql: "select e.id, e.name, d.id from employees e join departments d", params: [1, null] });

    expect(await db.prepare("select 1").first("name")).toBe("Asha");
    const w = await db.prepare("insert into t values (?)").bind("x").run();
    expect(w.meta.changes).toBe(1);
    expect(w.meta.last_row_id).toBe(7);

    const b = await db.batch([db.prepare("insert into t values (1)"), db.prepare("select 2")]);
    expect(calls.at(-1)!.body).toEqual({
      batch: [
        { sql: "insert into t values (1)", params: [] },
        { sql: "select 2", params: [] },
      ],
    });
    expect(b).toHaveLength(2);
  });

  it("calls Workers AI and returns the binding-shaped result", async () => {
    const env = await freshEnv({ CLOUDFLARE_ACCOUNT_ID: "acct", CLOUDFLARE_API_TOKEN: "tok", VERCEL: "1" });
    const out = await (env.AI as unknown as { run: (m: string, i: unknown) => Promise<{ response: string }> }).run("@cf/x/y", { messages: [] });
    expect(out.response).toBe("Hello");
    expect(calls[0]!.url).toBe("https://api.cloudflare.com/client/v4/accounts/acct/ai/run/@cf/x/y");
  });

  it("falls back to local SQLite with no AI when credentials are missing", async () => {
    const env = await freshEnv({ CLOUDFLARE_ACCOUNT_ID: undefined, CLOUDFLARE_API_TOKEN: undefined, VERCEL: undefined, HRP_SQLITE_PATH: ":memory:" });
    expect(env.AI).toBeUndefined();
    await env.DB.exec("create table t (id text, n int)");
    await env.DB.batch([env.DB.prepare("insert into t values (?, ?)").bind("a", 1), env.DB.prepare("insert into t values (?, ?)").bind("b", 2)]);
    const joined = await env.DB.prepare("select x.id, y.id from t x join t y on y.n = x.n + 1").raw();
    expect(joined).toEqual([["a", "b"]]);
    expect(fetch).not.toHaveBeenCalled();
  });
});
