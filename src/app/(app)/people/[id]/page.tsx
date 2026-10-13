import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { CalendarDays, Mail, MapPin, Phone, Briefcase } from "lucide-react";
import { getDb, schema } from "@/db/client";
import { requireUser, isPeopleTeam } from "@/lib/auth";
import { leaveBalances } from "@/lib/queries";
import { salaryBreakup } from "@/lib/payroll";
import { Avatar, Panel, Pill, Progress, StatusPill } from "@/components/ui";
import { daysBetween, formatDate, formatINR, plural, todayIST } from "@/lib/utils";
import { EditProfile, Offboard } from "./client";

const fromEmp = alias(schema.employees, "from_emp");

function tenure(joined: string, today: string) {
  const days = daysBetween(joined, today);
  if (days < 0) return `Joins in ${plural(-days, "day")}`;
  const y = Math.floor(days / 365);
  const m = Math.floor((days % 365) / 30);
  return y ? `${plural(y, "year")}${m ? `, ${plural(m, "month")}` : ""}` : m ? plural(m, "month") : plural(days, "day");
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const db = await getDb();
  const emp = await db.query.employees.findFirst({ where: eq(schema.employees.id, id) });
  if (!emp) notFound();
  const today = todayIST();
  const self = emp.id === user.id;
  const canSeePrivate = self || isPeopleTeam(user) || emp.managerId === user.id;

  const [dept, manager, reports, departments, everyone, assets, kudos, goals, salary, chain] = await Promise.all([
    emp.departmentId ? db.query.departments.findFirst({ where: eq(schema.departments.id, emp.departmentId) }) : null,
    emp.managerId ? db.query.employees.findFirst({ where: eq(schema.employees.id, emp.managerId) }) : null,
    db
      .select()
      .from(schema.employees)
      .where(and(eq(schema.employees.managerId, emp.id), inArray(schema.employees.status, ["active", "onboarding", "offboarding"]))),
    db.select().from(schema.departments),
    isPeopleTeam(user) ? db.select({ id: schema.employees.id, name: schema.employees.name }).from(schema.employees).orderBy(schema.employees.name) : [],
    canSeePrivate ? db.select().from(schema.assets).where(eq(schema.assets.assignedTo, emp.id)) : [],
    db
      .select({ k: schema.kudos, from: fromEmp.name, fromHue: fromEmp.hue })
      .from(schema.kudos)
      .innerJoin(fromEmp, eq(schema.kudos.fromId, fromEmp.id))
      .where(eq(schema.kudos.toId, emp.id))
      .orderBy(desc(schema.kudos.createdAt))
      .limit(4),
    db
      .select({
        oid: schema.objectives.id,
        title: schema.objectives.title,
        start: schema.keyResults.start,
        target: schema.keyResults.target,
        current: schema.keyResults.current,
      })
      .from(schema.objectives)
      .innerJoin(schema.keyResults, eq(schema.keyResults.objectiveId, schema.objectives.id))
      .where(eq(schema.objectives.ownerId, emp.id)),
    canSeePrivate ? db.query.salaryStructures.findFirst({ where: eq(schema.salaryStructures.employeeId, emp.id) }) : null,
    (async () => {
      const out: { id: string; name: string; title: string }[] = [];
      let cur = emp.managerId;
      while (cur && out.length < 6) {
        const m = await db.query.employees.findFirst({ where: eq(schema.employees.id, cur) });
        if (!m) break;
        out.unshift({ id: m.id, name: m.name, title: m.title });
        cur = m.managerId;
      }
      return out;
    })(),
  ]);
  const balances = canSeePrivate ? await leaveBalances(emp.id, today.slice(0, 4)) : [];

  const objectives = new Map<string, { title: string; p: number[] }>();
  for (const g of goals) {
    const o = objectives.get(g.oid) ?? { title: g.title, p: [] };
    o.p.push(g.target === g.start ? 1 : Math.max(0, Math.min(1, (g.current - g.start) / (g.target - g.start))));
    objectives.set(g.oid, o);
  }

  return (
    <div className="space-y-6">
      <nav aria-label="Reporting line" className="text-ink-3 flex flex-wrap items-center gap-1 text-sm">
        <Link href="/people" className="hover:text-ink">
          People
        </Link>
        {chain.map((c) => (
          <span key={c.id} className="flex items-center gap-1">
            <span aria-hidden>/</span>
            <Link href={`/people/${c.id}`} className="hover:text-ink">
              {c.name}
            </Link>
          </span>
        ))}
      </nav>

      <section className="panel overflow-hidden">
        <div
          className="h-20"
          style={{ background: `linear-gradient(100deg, oklch(0.9 0.05 ${dept?.hue ?? 220}) 0%, oklch(0.94 0.03 ${emp.hue}) 100%)` }}
          aria-hidden
        />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <Avatar name={emp.name} hue={emp.hue} size={88} className="ring-surface -mt-11 ring-4" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl">{emp.name}</h1>
              {emp.status !== "active" ? <StatusPill status={emp.status} /> : null}
            </div>
            <p className="text-ink-2">
              {emp.title}, {dept?.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {self || isPeopleTeam(user) ? (
              <EditProfile
                emp={{
                  id: emp.id,
                  title: emp.title,
                  departmentId: emp.departmentId,
                  managerId: emp.managerId,
                  role: emp.role,
                  location: emp.location,
                  phone: emp.phone,
                  bio: emp.bio,
                  skills: emp.skills,
                }}
                hr={isPeopleTeam(user)}
                departments={departments.map((d) => ({ id: d.id, name: d.name }))}
                people={everyone.filter((p) => p.id !== emp.id)}
              />
            ) : null}
            {isPeopleTeam(user) && !self && emp.status === "active" ? <Offboard id={emp.id} name={emp.name} today={today} /> : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Panel title="About">
            {emp.bio ? <p className="mb-4 text-sm">{emp.bio}</p> : null}
            <dl className="space-y-2.5 text-sm">
              {[
                [
                  Mail,
                  "Email",
                  <a key="e" className="link" href={`mailto:${emp.email}`}>
                    {emp.email}
                  </a>,
                ],
                [Phone, "Phone", emp.phone ?? "—"],
                [MapPin, "Location", emp.location],
                [Briefcase, "Employee ID", `${emp.code}, ${emp.employmentType.replace("_", "-")}`],
                [CalendarDays, "Joined", `${formatDate(emp.joinedOn, { day: "numeric", month: "long", year: "numeric" })} (${tenure(emp.joinedOn, today)})`],
                ...(emp.exitOn ? [[CalendarDays, "Last day", formatDate(emp.exitOn, { day: "numeric", month: "long", year: "numeric" })] as const] : []),
              ].map(([Icon, label, value]) => {
                const I = Icon as typeof Mail;
                return (
                  <div key={label as string} className="flex gap-3">
                    <I className="text-ink-3 mt-0.5 size-4 shrink-0" aria-hidden />
                    <dt className="sr-only">{label as string}</dt>
                    <dd className="min-w-0 break-words">{value as React.ReactNode}</dd>
                  </div>
                );
              })}
            </dl>
            {emp.skills ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {emp.skills.split(",").map((s) => (
                  <Pill key={s}>{s.trim()}</Pill>
                ))}
              </div>
            ) : null}
          </Panel>

          <Panel title="Team">
            {manager ? (
              <div className="mb-4">
                <p className="text-ink-3 mb-2 text-xs">Reports to</p>
                <Link href={`/people/${manager.id}`} className="hover:bg-surface-2 flex items-center gap-3 rounded-lg p-1">
                  <Avatar name={manager.name} hue={manager.hue} size={34} />
                  <span className="text-sm">
                    <span className="block font-medium">{manager.name}</span>
                    <span className="text-ink-2">{manager.title}</span>
                  </span>
                </Link>
              </div>
            ) : null}
            {reports.length ? (
              <>
                <p className="text-ink-3 mb-2 text-xs">{plural(reports.length, "direct report")}</p>
                <ul className="space-y-1">
                  {reports.map((r) => (
                    <li key={r.id}>
                      <Link href={`/people/${r.id}`} className="hover:bg-surface-2 flex items-center gap-3 rounded-lg p-1">
                        <Avatar name={r.name} hue={r.hue} size={30} />
                        <span className="text-sm">
                          <span className="font-medium">{r.name}</span> <span className="text-ink-2">{r.title}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : !manager ? (
              <p className="text-ink-2 text-sm">No reporting line set.</p>
            ) : null}
          </Panel>
        </div>

        <div className="space-y-6">
          {canSeePrivate ? (
            <Panel title={self ? "Your time off this year" : "Time off this year"}>
              <div className="grid grid-cols-3 gap-4">
                {balances
                  .filter((b) => b.code !== "LOP")
                  .map((b) => (
                    <div key={b.id}>
                      <p className="text-ink-2 text-sm">{b.name}</p>
                      <p className="font-display tabular text-2xl font-semibold">
                        {b.remaining}
                        <span className="text-ink-3 text-sm font-normal"> / {b.annualQuota}</span>
                      </p>
                    </div>
                  ))}
              </div>
            </Panel>
          ) : null}

          {canSeePrivate && salary ? (
            <Panel
              title="Compensation"
              action={<span className="text-ink-3 text-xs">Visible to {self ? "you" : emp.name.split(" ")[0]}, their manager and HR</span>}
            >
              {(() => {
                const b = salaryBreakup(salary.annualCtc);
                return (
                  <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-ink-2">Annual CTC</dt>
                      <dd className="font-display tabular text-xl font-semibold">{formatINR(salary.annualCtc)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-2">Monthly gross</dt>
                      <dd className="font-display tabular text-xl font-semibold">{formatINR(b.gross)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-2">Basic</dt>
                      <dd className="font-display tabular text-xl font-semibold">{formatINR(b.basic)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-2">Employer PF</dt>
                      <dd className="font-display tabular text-xl font-semibold">{formatINR(b.employerPf)}</dd>
                    </div>
                  </dl>
                );
              })()}
            </Panel>
          ) : null}

          <Panel
            title="Goals this quarter"
            action={
              <Link className="link text-sm" href="/performance">
                Goals & reviews
              </Link>
            }
          >
            {objectives.size ? (
              <ul className="space-y-4">
                {[...objectives.entries()].map(([oid, o]) => {
                  const p = o.p.reduce((a, b) => a + b, 0) / o.p.length;
                  return (
                    <li key={oid}>
                      <div className="mb-1.5 flex justify-between gap-3 text-sm">
                        <span className="font-medium">{o.title}</span>
                        <span className="text-ink-2 tabular">{Math.round(p * 100)}%</span>
                      </div>
                      <Progress value={p} tone={p >= 0.7 ? "teal" : p >= 0.4 ? "marigold" : "rose"} label={o.title} />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-ink-2 text-sm">No goals set this quarter.</p>
            )}
          </Panel>

          {kudos.length ? (
            <Panel title="Kudos received">
              <ul className="space-y-3">
                {kudos.map((k) => (
                  <li key={k.k.id} className="flex gap-3 text-sm">
                    <Avatar name={k.from} hue={k.fromHue} size={28} />
                    <p>
                      <span className="font-medium">{k.from}</span> <span className="text-ink-3">for {k.k.value}</span>
                      <span className="text-ink-2 block">{k.k.message}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          {canSeePrivate && assets.length ? (
            <Panel title="Equipment" bodyClassName="p-0">
              <ul className="divide-line divide-y text-sm">
                {assets.map((a) => (
                  <li key={a.id} className="flex justify-between gap-3 px-5 py-2.5">
                    <span>{a.name}</span>
                    <span className="text-ink-3 tabular">{a.tag}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
