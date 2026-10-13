import { buildSeedStatements } from "./seed";
import { todayIST } from "../lib/utils";

/** Wipes and reseeds the demo database. Used by the Settings page and the nightly cron. */
export async function resetDemoData(db: D1Database) {
  const statements = buildSeedStatements(todayIST(), { includeDeletes: true });
  for (let i = 0; i < statements.length; i += 80) {
    await db.batch(statements.slice(i, i + 80).map((s) => db.prepare(s)));
  }
  return statements.length;
}
