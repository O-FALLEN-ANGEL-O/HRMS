import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { AlertCircle, AlertTriangle, Info, Sparkles } from "lucide-react";
import { getDb, schema } from "@/db/client";
import { requireRole, canRunPayroll } from "@/lib/auth";
import { Avatar, Pill, StatusPill } from "@/components/ui";
import { formatINR, monthLabel } from "@/lib/utils";
import { RunActions } from "../client";
import type { PayrollFinding } from "@/lib/ai";

export default async function RunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  await requireRole(canRunPayroll);
  const db = await getDb();
  const run = await db.query.payrollRuns.findFirst({ where: eq(schema.payrollRuns.id, runId) });
  if (!run) notFound();
  const slips = await db
    .select({ p: schema.payslips, name: schema.employees.name, hue: schema.employees.hue, code: schema.employees.code })
    .from(schema.payslips)
    .innerJoin(schema.employees, eq(schema.payslips.employeeId, schema.employees.id))
    .where(eq(schema.payslips.runId, runId))
    .orderBy(schema.employees.name);
  const review = run.aiReview ? (JSON.parse(run.aiReview) as { summary: string; source: "ai" | "rules"; findings: PayrollFinding[] }) : null;
  const sum = (k: "gross" | "pf" | "esi" | "pt" | "tds" | "net" | "reimbursements") => slips.reduce((a, s) => a + s.p[k], 0);
  const errors = review?.findings.filter((f) => f.severity === "error") ?? [];
  const flagged = new Map((review?.findings ?? []).filter((f) => f.severity !== "info").map((f) => [f.employee, f]));

  return (
    <div className="space-y-6">
      <nav className="no-print text-ink-3 text-sm">
        <Link href="/payroll" className="hover:text-ink">
          Payroll
        </Link>{" "}
        / {monthLabel(run.month)}
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl">Payroll, {monthLabel(run.month)}</h1>
            <StatusPill status={run.status} />
          </div>
          <p className="text-ink-2 mt-1">
            {slips.length} people, {formatINR(sum("net"))} to pay out
          </p>
        </div>
        <RunActions runId={run.id} month={run.month} status={run.status} hasErrors={errors.length > 0} />
      </div>

      <section aria-label="Totals" className="panel bg-line grid grid-cols-2 gap-px overflow-hidden sm:grid-cols-3 lg:grid-cols-6">
        {(
          [
            ["Gross", sum("gross")],
            ["Reimbursements", sum("reimbursements")],
            ["PF", sum("pf")],
            ["ESI + PT", sum("esi") + sum("pt")],
            ["TDS", sum("tds")],
            ["Net pay", sum("net")],
          ] as const
        ).map(([l, v]) => (
          <div key={l} className="bg-surface px-4 py-3.5">
            <p className="text-ink-2 text-sm">{l}</p>
            <p className="font-display tabular text-xl font-semibold">{formatINR(v)}</p>
          </div>
        ))}
      </section>

      {review ? (
        <section className="panel p-5" aria-labelledby="audit">
          <div className="flex items-center gap-2">
            <Sparkles className="text-marigold size-4" aria-hidden />
            <h2 id="audit" className="font-display font-semibold">
              Payroll check
            </h2>
            <Pill t={review.source === "ai" ? "info" : "neutral"}>{review.source === "ai" ? "Workers AI" : "Rule checks"}</Pill>
          </div>
          <p className="mt-2 max-w-[75ch]">{review.summary}</p>
          {review.findings.length ? (
            <ul className="mt-3 space-y-1.5 text-sm">
              {review.findings
                .sort((a, b) => ["error", "warning", "info"].indexOf(a.severity) - ["error", "warning", "info"].indexOf(b.severity))
                .slice(0, 12)
                .map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {f.severity === "error" ? (
                      <AlertCircle className="text-rose mt-0.5 size-4 shrink-0" aria-label="Error" />
                    ) : f.severity === "warning" ? (
                      <AlertTriangle className="text-marigold mt-0.5 size-4 shrink-0" aria-label="Warning" />
                    ) : (
                      <Info className="text-ink-3 mt-0.5 size-4 shrink-0" aria-label="Note" />
                    )}
                    <span>
                      <span className="font-medium">{f.employee}</span>: {f.message}
                    </span>
                  </li>
                ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2/60 text-ink-3 text-left">
              <tr>
                <th className="px-5 py-2.5 font-medium">Employee</th>
                <th className="px-3 py-2.5 text-right font-medium">Days</th>
                <th className="px-3 py-2.5 text-right font-medium">Gross</th>
                <th className="px-3 py-2.5 text-right font-medium">PF</th>
                <th className="px-3 py-2.5 text-right font-medium">ESI</th>
                <th className="px-3 py-2.5 text-right font-medium">PT</th>
                <th className="px-3 py-2.5 text-right font-medium">TDS</th>
                <th className="px-5 py-2.5 text-right font-medium">Net</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {slips.map((s) => {
                const f = flagged.get(s.name);
                return (
                  <tr key={s.p.id} className={f?.severity === "error" ? "bg-rose-soft/50" : f ? "bg-marigold-soft/40" : ""}>
                    <td className="px-5 py-2.5">
                      <Link href={`/payroll/payslip/${s.p.id}`} className="flex items-center gap-2.5 hover:underline">
                        <Avatar name={s.name} hue={s.hue} size={26} />
                        <span>
                          {s.name} <span className="text-ink-3 text-xs">{s.code}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="tabular px-3 py-2.5 text-right">{s.p.daysPayable}</td>
                    <td className="tabular px-3 py-2.5 text-right">{formatINR(s.p.gross)}</td>
                    <td className="text-ink-2 tabular px-3 py-2.5 text-right">{formatINR(s.p.pf)}</td>
                    <td className="text-ink-2 tabular px-3 py-2.5 text-right">{s.p.esi ? formatINR(s.p.esi) : "—"}</td>
                    <td className="text-ink-2 tabular px-3 py-2.5 text-right">{s.p.pt ? formatINR(s.p.pt) : "—"}</td>
                    <td className="text-ink-2 tabular px-3 py-2.5 text-right">{s.p.tds ? formatINR(s.p.tds) : "—"}</td>
                    <td className="tabular px-5 py-2.5 text-right font-medium">{formatINR(s.p.net)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
