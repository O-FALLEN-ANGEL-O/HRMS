import { MIGRATIONS } from "./migrations.gen";
import { resetDemoData } from "./reset";

/**
 * Brings the database up to date the first time each Worker instance uses it:
 * applies any pending migrations, then loads the demo company if the database
 * has never been seeded. This lets a fresh, empty D1 database work with no
 * deploy-time API permissions. Migrations are recorded in wrangler's own
 * `d1_migrations` table, so `wrangler d1 migrations apply` stays compatible.
 */
const TABLE = "d1_migrations";
let ready: Promise<void> | null = null;

export function ensureDatabase(db: D1Database): Promise<void> {
  ready ??= setup(db).catch((err) => {
    ready = null; // retry on the next request
    throw err;
  });
  return ready;
}

async function setup(db: D1Database) {
  await db.exec(
    `CREATE TABLE IF NOT EXISTS "${TABLE}"(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);`,
  );
  const { results } = await db.prepare(`SELECT name FROM "${TABLE}"`).all<{ name: string }>();
  const applied = new Set(results.map((r) => r.name));

  for (const m of MIGRATIONS) {
    if (applied.has(m.name)) continue;
    // A batch runs as one transaction; the INSERT makes a second, racing instance fail instead of double-applying.
    try {
      await db.batch([db.prepare(`INSERT INTO "${TABLE}" (name) VALUES (?)`).bind(m.name), ...m.statements.map((s) => db.prepare(s))]);
    } catch (err) {
      const now = await db.prepare(`SELECT 1 FROM "${TABLE}" WHERE name = ?`).bind(m.name).first();
      if (!now) throw err; // a genuine failure, not a race
    }
  }

  // Seed once. Claiming the marker row first means only one instance seeds.
  const claimed = await db
    .prepare(`INSERT OR IGNORE INTO "${TABLE}" (name) VALUES ('demo-seed')`)
    .run()
    .then((r) => r.meta.changes === 1);
  if (claimed) {
    const row = await db.prepare("SELECT count(*) AS n FROM employees").first<{ n: number }>();
    if (!row?.n) {
      try {
        await resetDemoData(db);
      } catch (err) {
        await db.prepare(`DELETE FROM "${TABLE}" WHERE name = 'demo-seed'`).run(); // let a later request try again
        throw err;
      }
    }
  }
}
