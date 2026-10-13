import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { requireUser, canRunPayroll } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { formatINR, monthLabel } from "@/lib/utils";
import { PrintButton } from "../../client";

export const metadata = { title: "Payslip" };

function words(n: number): string {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x: number) => (x < 20 ? a[x]! : `${b[Math.floor(x / 10)]}${x % 10 ? ` ${a[x % 10]}` : ""}`);
  const three = (x: number) => (x >= 100 ? `${a[Math.floor(x / 100)]} Hundred${x % 100 ? ` ${two(x % 100)}` : ""}` : two(x));
  if (n === 0) return "Zero";
  const parts: string[] = [];
  const crore = Math.floor(n / 1_00_00_000);
  const lakh = Math.floor((n % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((n % 1_00_000) / 1000);
  const rest = n % 1000;
  if (crore) parts.push(`${three(crore)} Crore`);
  if (lakh) parts.push(`${two(lakh)} Lakh`);
  if (thousand) parts.push(`${two(thousand)} Thousand`);
  if (rest) parts.push(three(rest));
  return parts.join(" ");
}

export default async function PayslipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const db = await getDb();
  const rows = await db
    .select({ p: schema.payslips, run: schema.payrollRuns, e: schema.employees, dept: schema.departments.name })
    .from(schema.payslips)
    .innerJoin(schema.payrollRuns, eq(schema.payslips.runId, schema.payrollRuns.id))
    .innerJoin(schema.employees, eq(schema.payslips.employeeId, schema.employees.id))
    .leftJoin(schema.departments, eq(schema.employees.departmentId, schema.departments.id))
    .where(eq(schema.payslips.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) notFound();
  if (row.e.id !== user.id && !canRunPayroll(user)) notFound();
  if (row.run.status !== "finalized" && !canRunPayroll(user)) notFound();
  const { p, run, e } = row;
  const deductions = p.pf + p.esi + p.pt + p.tds;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="no-print flex items-center justify-between">
        <Link href="/payroll" className="text-ink-3 hover:text-ink text-sm">
          Back to payroll
        </Link>
        <PrintButton />
      </div>
      <article className="panel p-8 print:border-0 print:p-0">
        <header className="border-line flex items-start justify-between border-b pb-5">
          <div>
            <Logo href="/home" />
            <p className="text-ink-2 mt-2 text-sm">Northwind Labs Pvt. Ltd., Bengaluru 560001</p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-semibold">Payslip</p>
            <p className="text-ink-2">{monthLabel(run.month)}</p>
            {run.status !== "finalized" ? <p className="text-marigold-ink mt-1 text-sm font-medium">Draft, not yet published</p> : null}
          </div>
        </header>
        <dl className="border-line grid grid-cols-2 gap-x-8 gap-y-1.5 border-b py-5 text-sm sm:grid-cols-3">
          {[
            ["Name", e.name],
            ["Employee ID", e.code],
            ["Designation", e.title],
            ["Team", row.dept ?? "—"],
            ["Location", e.location],
            ["Days paid", String(p.daysPayable)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-ink-3">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-8 py-5 sm:grid-cols-2">
          <table className="w-full text-sm">
            <caption className="font-display pb-2 text-left font-semibold">Earnings</caption>
            <tbody className="divide-line divide-y">
              {[
                ["Basic", p.basic],
                ["House rent allowance", p.hra],
                ["Special allowance", p.special],
                ...(p.reimbursements ? [["Reimbursements", p.reimbursements] as const] : []),
              ].map(([k, v]) => (
                <tr key={k as string}>
                  <td className="py-1.5">{k}</td>
                  <td className="tabular py-1.5 text-right">{formatINR(v as number)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2">Total earnings</td>
                <td className="tabular py-2 text-right">{formatINR(p.gross)}</td>
              </tr>
            </tbody>
          </table>
          <table className="w-full text-sm">
            <caption className="font-display pb-2 text-left font-semibold">Deductions</caption>
            <tbody className="divide-line divide-y">
              {[
                ["Provident fund", p.pf],
                ["ESI", p.esi],
                ["Professional tax", p.pt],
                ["Income tax (TDS)", p.tds],
              ].map(([k, v]) => (
                <tr key={k as string}>
                  <td className="py-1.5">{k}</td>
                  <td className="tabular py-1.5 text-right">{formatINR(v as number)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2">Total deductions</td>
                <td className="tabular py-2 text-right">{formatINR(deductions)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer className="bg-surface-2 rounded-[10px] px-5 py-4 print:bg-transparent print:px-0">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-display text-lg font-semibold">Net pay</p>
            <p className="font-display tabular text-3xl font-semibold">{formatINR(p.net)}</p>
          </div>
          <p className="text-ink-2 mt-1 text-sm">Rupees {words(p.net)} only</p>
        </footer>
        <p className="text-ink-3 mt-5 text-xs">Computer-generated payslip for a fictional company in the HR+ demo. No signature required.</p>
      </article>
    </div>
  );
}
