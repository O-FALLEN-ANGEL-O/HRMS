import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { requireRole, isPeopleTeam } from "@/lib/auth";
import { PageHeader, Panel } from "@/components/ui";
import { formatDate, timeAgo } from "@/lib/utils";
import { PolicyEditor, ResetDemo } from "./client";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireRole(isPeopleTeam);
  const db = await getDb();
  const [types, holidays, policies, log] = await Promise.all([
    db.select().from(schema.leaveTypes),
    db.select().from(schema.holidays).orderBy(schema.holidays.date),
    db.select().from(schema.policies),
    db
      .select({ a: schema.auditLog, name: schema.employees.name })
      .from(schema.auditLog)
      .leftJoin(schema.employees, eq(schema.auditLog.actorId, schema.employees.id))
      .orderBy(desc(schema.auditLog.createdAt))
      .limit(25),
  ]);

  return (
    <>
      <PageHeader title="Settings" description="Company policies, leave rules and holidays. Policies are also what the HR assistant answers from." />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Policies" bodyClassName="p-0">
          <ul className="divide-line divide-y">
            {policies.map((p) => (
              <li key={p.id} className="flex items-start gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-ink-2 mt-0.5 line-clamp-2 text-sm">{p.body}</p>
                </div>
                <PolicyEditor policy={p} />
              </li>
            ))}
          </ul>
        </Panel>
        <div className="space-y-6">
          <Panel title="Leave types" bodyClassName="p-0">
            <table className="w-full text-sm">
              <tbody className="divide-line divide-y">
                {types.map((t) => (
                  <tr key={t.id}>
                    <td className="px-5 py-2.5">
                      <span className="mr-2 inline-block size-2 rounded-full" style={{ background: `oklch(0.62 0.12 ${t.hue})` }} aria-hidden />
                      {t.name}
                    </td>
                    <td className="text-ink-2 tabular px-5 py-2.5 text-right">{t.annualQuota ? `${t.annualQuota} days a year` : "Unlimited, unpaid"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <Panel title="Holidays" bodyClassName="p-0">
            <ul className="divide-line max-h-72 divide-y overflow-y-auto text-sm">
              {holidays.map((h) => (
                <li key={h.id} className="flex justify-between gap-3 px-5 py-2">
                  <span>
                    {h.name}
                    {h.optional ? <span className="text-ink-3 ml-2 text-xs">optional</span> : null}
                  </span>
                  <span className="text-ink-2 tabular">{formatDate(h.date, { day: "numeric", month: "short", year: "numeric" })}</span>
                </li>
              ))}
            </ul>
          </Panel>
          {user.role === "admin" ? (
            <Panel title="Demo data">
              <p className="text-ink-2 text-sm">
                Everything resets to the starting story every night at 2:00 IST. Reset now to undo your changes; everyone gets signed out.
              </p>
              <ResetDemo />
            </Panel>
          ) : null}
        </div>
      </div>
      <Panel title="Activity log" className="mt-6" bodyClassName="p-0">
        {log.length ? (
          <ul className="divide-line divide-y text-sm">
            {log.map(({ a, name }) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2 px-5 py-2.5">
                <span>
                  <span className="font-medium">{name ?? "System"}</span> <span className="text-ink-2">{a.action.replace(".", " ")}</span>{" "}
                  <span className="text-ink-3">{a.entityId}</span>
                </span>
                <span className="text-ink-3">{timeAgo(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-2 px-5 py-6 text-sm">Approvals, payroll runs and profile changes are recorded here.</p>
        )}
      </Panel>
    </>
  );
}
