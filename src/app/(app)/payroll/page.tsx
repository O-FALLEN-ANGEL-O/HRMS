import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { Wallet, FileText } from "lucide-react";
import { getDb, schema } from "@/db/client";
import { requireUser, canRunPayroll } from "@/lib/auth";
import { salaryBreakup } from "@/lib/payroll";
import { EmptyState, PageHeader, Panel, Stat, StatusPill } from "@/components/ui";
import { formatDate, formatINR, monthLabel, todayIST } from "@/lib/utils";
import { RunPayroll } from "./client";

export const metadata = { title: "Payroll" };

export default async function PayrollPage() {
  const user = await requireUser();
  const db = await getDb();
  const month = todayIST().slice(0, 7);

  const [mySlips, structure] = await Promise.all([
    db
      .select({ p: schema.payslips, month: schema.payrollRuns.month })
      .from(schema.payslips)
      .innerJoin(schema.payrollRuns, eq(schema.payslips.runId, schema.payrollRuns.id))
      .where(and(eq(schema.payslips.employeeId, user.id), eq(schema.payrollRuns.status, "finalized")))
      .orderBy(desc(schema.payrollRuns.month)),
    db.query.salaryStructures.findFirst({ where: eq(schema.salaryStructures.employeeId, user.id) }),
  ]);

  const runs = canRunPayroll(user)
    ? await db
        .select({
          r: schema.payrollRuns,
          headcount: sql<number>`count(${schema.payslips.id})`,
          gross: sql<number>`coalesce(sum(${schema.payslips.gross}),0)`,
          net: sql<number>`coalesce(sum(${schema.payslips.net}),0)`,
        })
        .from(schema.payrollRuns)
        .leftJoin(schema.payslips, eq(schema.payslips.runId, schema.payrollRuns.id))
        .groupBy(schema.payrollRuns.id)
        .orderBy(desc(schema.payrollRuns.month))
    : [];
  const currentRun = runs.find((r) => r.r.month === month);
  const b = structure ? salaryBreakup(structure.annualCtc) : null;

  return (
    <>
      <PageHeader
        title="Payroll"
        description={canRunPayroll(user) ? "Run payroll, review what changed, then finalize to publish payslips." : "Your payslips and salary breakup."}
        actions={
          canRunPayroll(user) && (!currentRun || currentRun.r.status === "draft") ? (
            <RunPayroll month={month} label={monthLabel(month)} rerun={!!currentRun} />
          ) : null
        }
      />

      {canRunPayroll(user) ? (
        <Panel title="Payroll runs" className="mb-6" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-ink-3 text-left">
                <tr className="border-line border-b">
                  <th className="px-5 py-2.5 font-medium">Month</th>
                  <th className="px-3 py-2.5 text-right font-medium">People</th>
                  <th className="px-3 py-2.5 text-right font-medium">Gross</th>
                  <th className="px-3 py-2.5 text-right font-medium">Net pay</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {runs.map((r) => (
                  <tr key={r.r.id}>
                    <td className="px-5 py-3 font-medium">{monthLabel(r.r.month)}</td>
                    <td className="tabular px-3 py-3 text-right">{r.headcount}</td>
                    <td className="tabular px-3 py-3 text-right">{formatINR(r.gross)}</td>
                    <td className="tabular px-3 py-3 text-right font-medium">{formatINR(r.net)}</td>
                    <td className="px-3 py-3">
                      <StatusPill status={r.r.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link className="link" href={`/payroll/${r.r.id}`}>
                        {r.r.status === "draft" ? "Review" : "Open"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {b ? (
          <Panel title="Your monthly salary">
            <dl className="divide-line divide-y text-sm">
              {[
                ["Basic", b.basic],
                ["House rent allowance", b.hra],
                ["Special allowance", b.special],
              ].map(([l, v]) => (
                <div key={l as string} className="flex justify-between py-2">
                  <dt className="text-ink-2">{l}</dt>
                  <dd className="tabular">{formatINR(v as number)}</dd>
                </div>
              ))}
              <div className="flex justify-between py-2 font-medium">
                <dt>Gross</dt>
                <dd className="tabular">{formatINR(b.gross)}</dd>
              </div>
              <div className="text-ink-2 flex justify-between py-2">
                <dt>Employer PF (part of CTC)</dt>
                <dd className="tabular">{formatINR(b.employerPf)}</dd>
              </div>
            </dl>
            <p className="text-ink-3 mt-3 text-xs">
              Annual CTC {formatINR(structure!.annualCtc)}, tax estimated under the {structure!.taxRegime} regime.
            </p>
          </Panel>
        ) : null}
        <Panel title="Your payslips" bodyClassName="p-0">
          {mySlips.length ? (
            <>
              <div className="bg-line grid grid-cols-2 gap-px">
                <div className="bg-surface px-5 py-4">
                  <Stat label={`Net pay, ${monthLabel(mySlips[0]!.month)}`} value={formatINR(mySlips[0]!.p.net)} />
                </div>
                <div className="bg-surface px-5 py-4">
                  <Stat
                    label="Tax deducted this year"
                    value={formatINR(mySlips.filter((s) => s.month.startsWith(month.slice(0, 4))).reduce((a, s) => a + s.p.tds, 0))}
                  />
                </div>
              </div>
              <ul className="divide-line border-line divide-y border-t">
                {mySlips.map((s) => (
                  <li key={s.p.id}>
                    <Link href={`/payroll/payslip/${s.p.id}`} className="hover:bg-surface-2 flex items-center gap-3 px-5 py-3">
                      <FileText className="text-ink-3 size-4" aria-hidden />
                      <span className="flex-1 text-sm font-medium">{monthLabel(s.month)}</span>
                      <span className="tabular text-sm">{formatINR(s.p.net)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState icon={<Wallet />} title="No payslips yet">
              Your first payslip appears here after your first payroll is finalized.
            </EmptyState>
          )}
        </Panel>
      </div>
      <p className="text-ink-3 mt-4 text-xs">
        Payroll last updated {formatDate(todayIST(), { day: "numeric", month: "long" })}. Figures are a demo of Indian payroll rules (PF, ESI, Karnataka PT,
        new-regime TDS) and aren&apos;t tax advice.
      </p>
    </>
  );
}
