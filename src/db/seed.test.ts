import { describe, expect, it } from "vitest";
import { buildSeedStatements } from "./seed";
import { addDays } from "../lib/utils";

describe("demo seed", () => {
  it("never creates a leave request that counts zero days, whatever today is", () => {
    const bad: string[] = [];
    for (let d = "2026-01-01"; d <= "2026-12-31"; d = addDays(d, 1)) {
      for (const stmt of buildSeedStatements(d)) {
        if (!stmt.startsWith("INSERT INTO leave_requests")) continue;
        const cols = stmt.slice(stmt.indexOf("(") + 1, stmt.indexOf(")")).split(", ");
        const values = stmt.slice(stmt.indexOf("VALUES (") + 8, -2).match(/'(?:[^']|'')*'|[^,\s][^,]*/g)!;
        const days = Number(values[cols.indexOf("days")]);
        if (!(days >= 1)) bad.push(`${d}: ${values[cols.indexOf("start_date")]} = ${days} days`);
      }
    }
    expect(bad).toEqual([]);
  });
});
