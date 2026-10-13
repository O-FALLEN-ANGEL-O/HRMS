/**
 * Indian payroll for a salaried employee, FY 2025-26 rules.
 * This is a demo calculator: it covers the common components (PF, ESI,
 * Karnataka professional tax, new-regime TDS estimate) and is not tax advice.
 */

export const PF_RATE = 0.12;
export const PF_WAGE_CEILING = 15_000;
export const ESI_EMPLOYEE_RATE = 0.0075;
export const ESI_GROSS_LIMIT = 21_000;
export const STANDARD_DEDUCTION_NEW = 75_000;
export const REBATE_87A_LIMIT_NEW = 12_00_000;

export interface SalaryBreakup {
  monthlyCtc: number;
  basic: number;
  hra: number;
  special: number;
  employerPf: number;
  gross: number;
}

export interface PayslipFigures {
  daysPayable: number;
  basic: number;
  hra: number;
  special: number;
  reimbursements: number;
  gross: number;
  pf: number;
  esi: number;
  pt: number;
  tds: number;
  net: number;
}

/** Splits annual CTC into monthly components (basic 50% of CTC, HRA 50% of basic). */
export function salaryBreakup(annualCtc: number): SalaryBreakup {
  const monthlyCtc = annualCtc / 12;
  const basic = Math.round(monthlyCtc * 0.5);
  const employerPf = Math.round(Math.min(basic, PF_WAGE_CEILING) * PF_RATE);
  const gross = Math.round(monthlyCtc - employerPf);
  const hra = Math.round(basic * 0.5);
  const special = Math.max(0, gross - basic - hra);
  return { monthlyCtc: Math.round(monthlyCtc), basic, hra, special, employerPf, gross };
}

/** New-regime income tax for FY 2025-26 including 87A rebate and 4% cess. */
export function annualTaxNewRegime(annualGross: number): number {
  const taxable = Math.max(0, annualGross - STANDARD_DEDUCTION_NEW);
  if (taxable <= REBATE_87A_LIMIT_NEW) return 0;
  const slabs: [number, number][] = [
    [4_00_000, 0],
    [8_00_000, 0.05],
    [12_00_000, 0.1],
    [16_00_000, 0.15],
    [20_00_000, 0.2],
    [24_00_000, 0.25],
    [Infinity, 0.3],
  ];
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of slabs) {
    if (taxable > lower) tax += (Math.min(taxable, upper) - lower) * rate;
    lower = upper;
  }
  // Marginal relief just above the rebate limit: tax can't exceed income over the limit.
  tax = Math.min(tax, taxable - REBATE_87A_LIMIT_NEW);
  return Math.round(tax * 1.04);
}

/** Karnataka professional tax (monthly). */
export function professionalTax(monthlyGross: number): number {
  return monthlyGross >= 25_000 ? 200 : 0;
}

export function computePayslip(input: { annualCtc: number; daysInMonth: number; unpaidDays: number; reimbursements?: number }): PayslipFigures {
  const b = salaryBreakup(input.annualCtc);
  const daysPayable = Math.max(0, input.daysInMonth - input.unpaidDays);
  const factor = input.daysInMonth > 0 ? daysPayable / input.daysInMonth : 0;

  const basic = Math.round(b.basic * factor);
  const hra = Math.round(b.hra * factor);
  const special = Math.round(b.special * factor);
  const earned = basic + hra + special;

  const pf = Math.round(Math.min(basic, PF_WAGE_CEILING) * PF_RATE);
  const esi = b.gross <= ESI_GROSS_LIMIT ? Math.ceil(earned * ESI_EMPLOYEE_RATE) : 0;
  const pt = professionalTax(earned);
  const tds = Math.round(annualTaxNewRegime(b.gross * 12) / 12);
  const reimbursements = Math.round(input.reimbursements ?? 0);
  const gross = earned + reimbursements;
  const net = gross - pf - esi - pt - tds;

  return { daysPayable, basic, hra, special, reimbursements, gross, pf, esi, pt, tds, net };
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
