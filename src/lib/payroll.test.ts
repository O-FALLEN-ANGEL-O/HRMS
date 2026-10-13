import { describe, expect, it } from "vitest";
import { annualTaxNewRegime, computePayslip, daysInMonth, professionalTax, salaryBreakup } from "./payroll";

describe("salaryBreakup", () => {
  it("splits CTC with basic at half and PF capped at the wage ceiling", () => {
    const b = salaryBreakup(12_00_000);
    expect(b.monthlyCtc).toBe(100_000);
    expect(b.basic).toBe(50_000);
    expect(b.employerPf).toBe(1_800);
    expect(b.gross).toBe(98_200);
    expect(b.basic + b.hra + b.special).toBe(b.gross);
  });

  it("uses actual basic for PF below the ceiling", () => {
    const b = salaryBreakup(2_40_000);
    expect(b.basic).toBe(10_000);
    expect(b.employerPf).toBe(1_200);
  });
});

describe("annualTaxNewRegime", () => {
  it("is zero up to the 87A rebate limit after standard deduction", () => {
    expect(annualTaxNewRegime(12_75_000)).toBe(0);
  });

  it("applies marginal relief just above the limit", () => {
    // taxable 12,10,000 -> slab tax 61,500 but capped to 10,000, plus cess
    expect(annualTaxNewRegime(12_85_000)).toBe(10_400);
  });

  it("computes slab tax for higher incomes", () => {
    // taxable 20,00,000: 20k + 40k + 60k + 80k = 2,00,000, plus 4% cess
    expect(annualTaxNewRegime(20_75_000)).toBe(2_08_000);
  });
});

describe("computePayslip", () => {
  it("prorates earnings for unpaid days and keeps net consistent", () => {
    const full = computePayslip({ annualCtc: 18_00_000, daysInMonth: 30, unpaidDays: 0 });
    const lop = computePayslip({ annualCtc: 18_00_000, daysInMonth: 30, unpaidDays: 3 });
    expect(lop.daysPayable).toBe(27);
    expect(lop.basic).toBeLessThan(full.basic);
    for (const p of [full, lop]) {
      expect(p.net).toBe(p.gross - p.pf - p.esi - p.pt - p.tds);
    }
  });

  it("deducts ESI only for gross at or under 21,000", () => {
    expect(computePayslip({ annualCtc: 2_40_000, daysInMonth: 30, unpaidDays: 0 }).esi).toBeGreaterThan(0);
    expect(computePayslip({ annualCtc: 6_00_000, daysInMonth: 30, unpaidDays: 0 }).esi).toBe(0);
  });

  it("adds approved reimbursements to gross", () => {
    const p = computePayslip({ annualCtc: 9_00_000, daysInMonth: 31, unpaidDays: 0, reimbursements: 2_500 });
    expect(p.reimbursements).toBe(2_500);
    expect(p.gross).toBe(p.basic + p.hra + p.special + 2_500);
  });
});

describe("helpers", () => {
  it("knows month lengths and PT threshold", () => {
    expect(daysInMonth("2026-02")).toBe(28);
    expect(daysInMonth("2028-02")).toBe(29);
    expect(professionalTax(24_999)).toBe(0);
    expect(professionalTax(25_000)).toBe(200);
  });
});
