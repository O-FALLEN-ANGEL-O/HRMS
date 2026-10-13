import { writeFileSync, mkdirSync } from "node:fs";
import { buildSeedStatements } from "../src/db/seed";
import { todayIST } from "../src/lib/utils";

const statements = buildSeedStatements(todayIST(), { includeDeletes: true });
mkdirSync("drizzle", { recursive: true });
writeFileSync("drizzle/seed.sql", statements.join("\n") + "\n");
console.log(`Wrote drizzle/seed.sql (${statements.length} statements)`);
