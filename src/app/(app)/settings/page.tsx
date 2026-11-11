import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { requireRole, isPeopleTeam } from "@/lib/auth";
import { PageHeader, Panel } from "@/components/ui";
import { formatDate, timeAgo } from "@/lib/utils";
import { PolicyEditor, ResetDemo, RulesForm } from "./client";
import { getRules } from "@/lib/settings";
import { emailProvider } from "@/lib/email";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireRole(isPeopleTeam);
  const db = await getDb();
  const [types, holidays, policies, log, rules, provider, outbox] = await Promise.all([
    db.select().from(schema.leaveTypes),
    db.select().from(schema.holidays).orderBy(schema.holidays.date),
    db.select().from(schema.policies),
    db
      .select({ a: schema.auditLog, name: schema.employees.name })
      .from(schema.auditLog)
      .leftJoin(schema.employees, eq(schema.auditLog.actorId, schema.employees.id))
      .orderBy(desc(schema.auditLog.createdAt))
      .limit(25),
    getRules(),
    emailProvider(),
    db
      .select({
        id: schema.emailOutbox.id,
        toEmail: schema.emailOutbox.toEmail,
        subject: schema.emailOutbox.subject,
        body: schema.emailOutbox.body,
        status: schema.emailOutbox.status,
        createdAt: schema.emailOutbox.createdAt,
      })
      .from(schema.emailOutbox)
      .orderBy(desc(schema.emailOutbox.createdAt))
      .limit(15),
  ]);

  return (
    <>
      <PageHeader title="Settings" description="Company rules, policies, leave types and holidays. Policies are also what the HR assistant answers from." />
      <div className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Rules" action={<span className="text-ink-3 text-xs">Apply to everyone from the moment you save</span>}>
          <RulesForm rules={rules} />
        </Panel>
        <Panel title="Email" bodyClassName="p-0">
          <p className={`mx-5 mt-4 mb-3 rounded-lg px-3 py-2 text-sm ${provider.ready ? "bg-teal-soft text-teal" : "bg-surface-2 text-ink-2"}`}>
            {provider.ready ? `Sending from ${provider.from} through Resend.` : provider.reason}
          </p>
          {outbox.length ? (
            <ul className="divide-line max-h-96 divide-y overflow-y-auto border-t text-sm">
              {outbox.map((m) => (
                <li key={m.id} className="px-5 py-2.5">
                  <details>
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{m.subject}</span>
                        <span className="text-ink-3 block truncate text-xs">to {m.toEmail}</span>
                      </span>
                      <span className="shrink-0 text-right text-xs">
                        <span className={m.status === "sent" ? "text-teal" : m.status === "failed" ? "text-rose" : "text-ink-3"}>
                          {m.status === "sent" ? "Sent" : m.status === "failed" ? "Failed" : "Not sent"}
                        </span>
                        <span className="text-ink-3 block">{timeAgo(m.createdAt)}</span>
                      </span>
                    </summary>
                    <pre className="bg-surface-2 mt-2 rounded-lg p-3 font-sans text-xs whitespace-pre-wrap">{m.body}</pre>
                  </details>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-2 border-line border-t px-5 py-6 text-sm">No emails yet. Approvals, decisions, payslips and invites send them.</p>
          )}
        </Panel>
      </div>
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
