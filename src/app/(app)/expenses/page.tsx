import { Suspense } from "react";
import { and, desc, eq } from "drizzle-orm";
import { Receipt } from "lucide-react";
import { getDb, schema } from "@/db/client";
import { requireUser, isPeopleTeam } from "@/lib/auth";
import { Avatar, EmptyState, PageHeader, Panel, Stat, StatusPill } from "@/components/ui";
import { formatDate, formatINR, todayIST } from "@/lib/utils";
import { NewExpense } from "./client";

export const metadata = { title: "Expenses" };

const CAT: Record<string, string> = { travel: "Travel", meals: "Meals", internet: "Internet", equipment: "Equipment", learning: "Learning", other: "Other" };

export default async function ExpensesPage() {
  const user = await requireUser();
  const db = await getDb();
  const year = todayIST().slice(0, 4);
  const mine = await db.select().from(schema.expenses).where(eq(schema.expenses.employeeId, user.id)).orderBy(desc(schema.expenses.spentOn));
  const thisYear = mine.filter((e) => e.spentOn.startsWith(year));
  const sum = (s: string[]) => thisYear.filter((e) => s.includes(e.status)).reduce((a, e) => a + e.amount, 0);
  const learning = thisYear.filter((e) => e.category === "learning" && ["approved", "reimbursed", "pending"].includes(e.status)).reduce((a, e) => a + e.amount, 0);

  const queue = isPeopleTeam(user)
    ? await db
        .select({ e: schema.expenses, name: schema.employees.name, hue: schema.employees.hue })
        .from(schema.expenses)
        .innerJoin(schema.employees, eq(schema.expenses.employeeId, schema.employees.id))
        .where(and(eq(schema.expenses.status, "approved")))
        .orderBy(desc(schema.expenses.decidedAt))
    : [];

  return (
    <>
      <PageHeader
        title="Expenses"
        description="File claims within 30 days. Approved claims are paid with the next payroll run."
        actions={
          <Suspense>
            <NewExpense today={todayIST()} />
          </Suspense>
        }
      />
      <section className="panel mb-6 grid grid-cols-2 gap-px overflow-hidden bg-line md:grid-cols-4" aria-label="Summary">
        {[
          { label: "Waiting for approval", value: formatINR(sum(["pending"])) },
          { label: "Approved, paid next payroll", value: formatINR(sum(["approved"])) },
          { label: `Reimbursed in ${year}`, value: formatINR(sum(["reimbursed"])) },
          { label: "Learning budget left", value: formatINR(Math.max(0, 25_000 - learning)), sub: "of ₹25,000 a year" },
        ].map((s) => (
          <div key={s.label} className="bg-surface px-4 py-4">
            <Stat {...s} />
          </div>
        ))}
      </section>

      <div className={isPeopleTeam(user) ? "grid gap-6 xl:grid-cols-[1.4fr_1fr]" : ""}>
        <Panel title="Your claims" bodyClassName="p-0">
          {mine.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-ink-3">
                  <tr className="border-b border-line">
                    <th className="px-5 py-2.5 font-medium">Date</th>
                    <th className="px-3 py-2.5 font-medium">What for</th>
                    <th className="px-3 py-2.5 font-medium">Category</th>
                    <th className="px-3 py-2.5 text-right font-medium">Amount</th>
                    <th className="px-5 py-2.5 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {mine.map((e) => (
                    <tr key={e.id}>
                      <td className="px-5 py-3 whitespace-nowrap text-ink-2 tabular">{formatDate(e.spentOn)}</td>
                      <td className="max-w-[28ch] px-3 py-3">{e.description}</td>
                      <td className="px-3 py-3 text-ink-2">{CAT[e.category]}</td>
                      <td className="px-3 py-3 text-right font-medium tabular">{formatINR(e.amount)}</td>
                      <td className="px-5 py-3 text-right">
                        <StatusPill status={e.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={<Receipt />} title="No claims yet">
              Travel, meals with customers, home internet and learning can be claimed here.
            </EmptyState>
          )}
        </Panel>
        {isPeopleTeam(user) ? (
          <Panel title="Approved, going into payroll" bodyClassName="p-0">
            {queue.length ? (
              <ul className="divide-y divide-line">
                {queue.map((q) => (
                  <li key={q.e.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <Avatar name={q.name} hue={q.hue} size={28} />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium">{q.name}</span> <span className="text-ink-2">{q.e.description}</span>
                    </span>
                    <span className="font-medium tabular">{formatINR(q.e.amount)}</span>
                  </li>
                ))}
                <li className="flex justify-between px-5 py-3 text-sm font-semibold">
                  <span>Total</span>
                  <span className="tabular">{formatINR(queue.reduce((a, q) => a + q.e.amount, 0))}</span>
                </li>
              </ul>
            ) : (
              <p className="px-5 py-6 text-sm text-ink-2">No approved claims waiting. They&apos;ll be added to payslips when you run payroll.</p>
            )}
          </Panel>
        ) : null}
      </div>
    </>
  );
}
