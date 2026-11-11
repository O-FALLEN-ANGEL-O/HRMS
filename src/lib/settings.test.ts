import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/db/client", () => ({ getDb: vi.fn(), schema: {} }));

const { DEFAULT_RULES, RulesSchema, toMinutes } = await import("./settings");

describe("company rules", () => {
  it("defaults match what the app did before rules were configurable", () => {
    expect(DEFAULT_RULES).toMatchObject({ coreStart: "11:00", coreEnd: "16:00", leaveBackdateDays: 30, claimWindowDays: 30, internetMonthlyLimit: 1000 });
    expect(RulesSchema.safeParse(DEFAULT_RULES).success).toBe(true);
  });

  it("parses form strings and rejects bad values", () => {
    const ok = RulesSchema.parse({ ...DEFAULT_RULES, claimWindowDays: "45", coreStart: "09:30" });
    expect(ok.claimWindowDays).toBe(45);
    expect(RulesSchema.safeParse({ ...DEFAULT_RULES, coreStart: "17:00" }).success).toBe(false); // ends before it starts
    expect(RulesSchema.safeParse({ ...DEFAULT_RULES, coreStart: "9:30" }).success).toBe(false);
    expect(RulesSchema.safeParse({ ...DEFAULT_RULES, claimWindowDays: "0" }).success).toBe(false);
  });

  it("converts HH:MM to minutes", () => {
    expect(toMinutes("11:00")).toBe(660);
    expect(toMinutes("09:45")).toBe(585);
  });
});
