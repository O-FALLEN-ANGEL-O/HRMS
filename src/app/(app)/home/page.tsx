import Link from "next/link";
import { and, desc, eq, gte, inArray, lte, ne, sql } from "drizzle-orm";
import { ArrowUpRight, CalendarDays, Cake, PartyPopper, Plane } from "lucide-react";
import { alias } from "drizzle-orm/sqlite-core";
import { getDb, schema } from "@/db/client";
import { requireUser, isPeopleTeam, type CurrentUser } from "@/lib/auth";
import { leaveBalances, pendingApprovals } from "@/lib/queries";
import { ClockCard } from "@/components/clock-card";
import { Avatar, Panel, Progress, Stat, StatusPill } from "@/components/ui";
import { addDays, formatDate, formatINR, isWeekend, monthLabel, plural, timeAgo, todayIST } from "@/lib/utils";

export const metadata = { title: "Home" };

const fromEmp = alias(schema.employees, "from_emp");
const toEmp = alias(schema.employees, "to_emp");

const {
  attendance,
  leaveRequests,
  employees,
  holidays,
  announcements,
  kudos,
  payslips,
  payrollRuns,
  objectives,
  keyResults,
  tickets,
  candidates,
  jobs,
  lifecycleTasks,
  surveyResponses,
  leaveTypes,
} = schema;

function greeting() {
  const h = (new Date().getUTCHours() + 5.5) % 24;
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

async function roleStats(user: CurrentUser, today: string) {
  const db = await getDb();
  const month = today.slice(0, 7);
  if (isPeopleTeam(user)) {
    const [headcount, present, onLeave, openTickets, joining, run, enps] = await Promise.all([
      db.$count(employees, ne(employees.status, "exited")),
      db.$count(attendance, eq(attendance.date, today)),
      db.$count(leaveRequests, and(eq(leaveRequests.status, "approved"), lte(leaveRequests.startDate, today), gte(leaveRequests.endDate, today))),
      db.$count(tickets, ne(tickets.status, "resolved")),
      db.$count(employees, inArray(employees.status, ["onboarding", "offboarding"])),
      db.query.payrollRuns.findFirst({ where: eq(payrollRuns.month, month) }),
      db.select({ s: surveyResponses.score }).from(surveyResponses).where(eq(surveyResponses.surveyId, "srv_enps")),
    ]);
    const prom = enps.filter((r) => r.s >= 9).length;
    const det = enps.filter((r) => r.s <= 6).length;
    const enpsScore = enps.length ? Math.round(((prom - det) / enps.length) * 100) : null;
    return [
      { label: "In today", value: `${present}/${headcount}`, sub: `${onLeave} on leave`, href: "/attendance" },
      { label: "Joiners & leavers", value: joining, sub: "in progress", href: "/lifecycle" },
      { label: "Open tickets", value: openTickets, sub: "helpdesk", href: "/helpdesk" },
      {
        label: `Payroll, ${monthLabel(month).split(" ")[0]}`,
        value: run ? (run.status === "finalized" ? "Paid" : "Draft") : "Not run",
        sub: run ? "" : "ready to run",
        href: "/payroll",
      },
      { label: "eNPS", value: enpsScore === null ? "—" : enpsScore > 0 ? `+${enpsScore}` : enpsScore, sub: `${enps.length} responses`, href: "/surveys" },
    ];
  }
  if (user.role === "recruiter") {
    const [open, active, fresh, offers] = await Promise.all([
      db.$count(jobs, eq(jobs.status, "open")),
      db.$count(candidates, inArray(candidates.stage, ["screening", "interview", "offer"])),
      db.$count(candidates, eq(candidates.stage, "applied")),
      db.$count(candidates, eq(candidates.stage, "offer")),
    ]);
    return [
      { label: "Open roles", value: open, sub: "", href: "/recruitment" },
      { label: "New applicants", value: fresh, sub: "to screen", href: "/recruitment" },
      { label: "In process", value: active, sub: "screening to offer", href: "/recruitment" },
      { label: "Offers out", value: offers, sub: "", href: "/recruitment" },
    ];
  }
  const balances = await leaveBalances(user.id, today.slice(0, 4));
  const lastSlip = await db
    .select({ net: payslips.net, month: payrollRuns.month })
    .from(payslips)
    .innerJoin(payrollRuns, eq(payslips.runId, payrollRuns.id))
    .where(and(eq(payslips.employeeId, user.id), eq(payrollRuns.status, "finalized")))
    .orderBy(desc(payrollRuns.month))
    .limit(1);
  const stats: { label: string; value: React.ReactNode; sub: string; href: string }[] = balances
    .filter((b) => b.code !== "LOP")
    .map((b) => ({ label: b.name, value: b.remaining, sub: `of ${b.annualQuota} left`, href: "/time-off" }));
  if (lastSlip[0]) stats.push({ label: "Last payslip", value: formatINR(lastSlip[0].net), sub: monthLabel(lastSlip[0].month), href: "/payroll" });
  if (user.reportCount > 0) {
    const team = await db.select({ id: employees.id }).from(employees).where(eq(employees.managerId, user.id));
    const ids = team.map((t) => t.id);
    const out = await db.$count(
      leaveRequests,
      and(inArray(leaveRequests.employeeId, ids), eq(leaveRequests.status, "approved"), lte(leaveRequests.startDate, today), gte(leaveRequests.endDate, today)),
    );
    stats.unshift({ label: "Team out today", value: `${out}/${ids.length}`, sub: "on leave", href: "/time-off" });
  }
  return stats;
}

export default async function HomePage() {
  const user = await requireUser();
  const db = await getDb();
  const today = todayIST();
  const weekAhead = addDays(today, 14);

  const [todayRow, approvals, myPending, hol, upcomingLeave, people, pinned, recentKudos, goals, myTasks, stats] = await Promise.all([
    db.query.attendance.findFirst({ where: and(eq(attendance.employeeId, user.id), eq(attendance.date, today)) }),
    pendingApprovals(user),
    db
      .select({ r: leaveRequests, type: leaveTypes.name })
      .from(leaveRequests)
      .innerJoin(leaveTypes, eq(leaveRequests.leaveTypeId, leaveTypes.id))
      .where(and(eq(leaveRequests.employeeId, user.id), eq(leaveRequests.status, "pending"))),
    db
      .select()
      .from(holidays)
      .where(and(gte(holidays.date, today), lte(holidays.date, addDays(today, 45))))
      .orderBy(holidays.date),
    db
      .select({ r: leaveRequests, name: employees.name, hue: employees.hue })
      .from(leaveRequests)
      .innerJoin(employees, eq(leaveRequests.employeeId, employees.id))
      .where(
        and(
          eq(leaveRequests.status, "approved"),
          lte(leaveRequests.startDate, weekAhead),
          gte(leaveRequests.endDate, today),
          user.reportCount > 0 || isPeopleTeam(user) ? sql`1=1` : eq(employees.departmentId, user.departmentId ?? ""),
        ),
      )
      .orderBy(leaveRequests.startDate)
      .limit(6),
    db
      .select({ id: employees.id, name: employees.name, hue: employees.hue, birthday: employees.birthday, joinedOn: employees.joinedOn })
      .from(employees)
      .where(ne(employees.status, "exited")),
    db
      .select({ a: announcements, name: employees.name })
      .from(announcements)
      .innerJoin(employees, eq(announcements.authorId, employees.id))
      .orderBy(desc(announcements.pinned), desc(announcements.createdAt))
      .limit(1),
    db
      .select({ k: kudos, fromName: fromEmp.name, toName: toEmp.name, toHue: toEmp.hue })
      .from(kudos)
      .innerJoin(fromEmp, eq(fromEmp.id, kudos.fromId))
      .innerJoin(toEmp, eq(toEmp.id, kudos.toId))
      .orderBy(desc(kudos.createdAt))
      .limit(3),
    db
      .select({ id: objectives.id, title: objectives.title, start: keyResults.start, target: keyResults.target, current: keyResults.current })
      .from(objectives)
      .innerJoin(keyResults, eq(keyResults.objectiveId, objectives.id))
      .where(eq(objectives.ownerId, user.id)),
    db
      .select({ t: lifecycleTasks, name: employees.name })
      .from(lifecycleTasks)
      .innerJoin(employees, eq(lifecycleTasks.employeeId, employees.id))
      .where(
        and(
          eq(lifecycleTasks.ownerRole, user.role),
          user.role === "manager" ? eq(employees.managerId, user.id) : user.role === "employee" ? eq(lifecycleTasks.employeeId, user.id) : sql`1=1`,
          sql`${lifecycleTasks.doneAt} is null`,
          lte(lifecycleTasks.dueOn, addDays(today, 7)),
        ),
      )
      .orderBy(lifecycleTasks.dueOn)
      .limit(5),
    roleStats(user, today),
  ]);

  const onLeaveToday = upcomingLeave.find((l) => l.r.employeeId === user.id && l.r.startDate <= today && l.r.endDate >= today);
  const holidayToday = hol.find((h) => h.date === today && !h.optional);

  // Birthdays and work anniversaries in the next 14 days.
  const md = (d: string) => d.slice(5);
  const upcomingDays = Array.from({ length: 15 }, (_, i) => md(addDays(today, i)));
  const celebrations = people
    .flatMap((p) => {
      const out: { id: string; name: string; hue: number; kind: "birthday" | "anniversary"; date: string; years?: number }[] = [];
      if (p.birthday && upcomingDays.includes(md(p.birthday))) out.push({ ...p, kind: "birthday", date: `${today.slice(0, 4)}-${md(p.birthday)}` });
      const years = Number(today.slice(0, 4)) - Number(p.joinedOn.slice(0, 4));
      if (years > 0 && upcomingDays.includes(md(p.joinedOn))) out.push({ ...p, kind: "anniversary", date: `${today.slice(0, 4)}-${md(p.joinedOn)}`, years });
      return out;
    })
    .map((c) => ({ ...c, date: c.date < today ? addDays(c.date, 365) : c.date }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const goalsByObj = new Map<string, { title: string; progress: number[] }>();
  for (const g of goals) {
    const p = g.target === g.start ? 1 : Math.max(0, Math.min(1, (g.current - g.start) / (g.target - g.start)));
    const e = goalsByObj.get(g.id) ?? { title: g.title, progress: [] };
    e.progress.push(p);
    goalsByObj.set(g.id, e);
  }

  const waiting = approvals.leave.length + approvals.regularizations.length + approvals.expenses.length;
  const first = user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-ink-2">{formatDate(today, { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="text-4xl">
            {greeting()}, {first}
          </h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <Panel className="flex flex-col" bodyClassName="flex flex-1 items-center p-6">
          <ClockCard
            today={todayRow ? { checkIn: todayRow.checkIn, checkOut: todayRow.checkOut, mode: todayRow.mode } : null}
            isWorkday={!isWeekend(today) && !holidayToday}
            holiday={holidayToday ? `Holiday: ${holidayToday.name}` : null}
            onLeave={onLeaveToday ? "You're on leave today" : null}
          />
        </Panel>

        <Panel
          title={waiting ? "Waiting on you" : "Your requests"}
          action={
            waiting ? (
              <Link href="/approvals" className="link inline-flex items-center gap-1 text-sm">
                Review all <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            ) : null
          }
          bodyClassName="p-0"
        >
          {waiting ? (
            <ul className="divide-line divide-y">
              {[
                ...approvals.leave.map((a) => ({
                  id: a.r.id,
                  name: a.name,
                  hue: a.hue,
                  what: `${a.r.days === 1 ? "1 day" : `${a.r.days} days`} ${a.type.toLowerCase()}, from ${formatDate(a.r.startDate)}`,
                  when: a.r.createdAt,
                })),
                ...approvals.regularizations.map((a) => ({
                  id: a.r.id,
                  name: a.name,
                  hue: a.hue,
                  what: `Attendance correction for ${formatDate(a.r.date)}`,
                  when: a.r.createdAt,
                })),
                ...approvals.expenses.map((a) => ({
                  id: a.r.id,
                  name: a.name,
                  hue: a.hue,
                  what: `${formatINR(a.r.amount)} ${a.r.category} expense`,
                  when: a.r.createdAt,
                })),
              ]
                .slice(0, 5)
                .map((i) => (
                  <li key={i.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={i.name} hue={i.hue} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{i.name}</p>
                      <p className="text-ink-2 truncate text-sm">{i.what}</p>
                    </div>
                    <span className="text-ink-3 shrink-0 text-xs">{timeAgo(i.when)}</span>
                  </li>
                ))}
              {waiting > 5 ? <li className="text-ink-2 px-5 py-3 text-sm">and {plural(waiting - 5, "more request")}</li> : null}
            </ul>
          ) : myPending.length ? (
            <ul className="divide-line divide-y">
              {myPending.map((p) => (
                <li key={p.r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{p.type}</p>
                    <p className="text-ink-2 text-sm">
                      {formatDate(p.r.startDate)}
                      {p.r.endDate !== p.r.startDate ? ` to ${formatDate(p.r.endDate)}` : ""}, {plural(p.r.days, "day")}
                    </p>
                  </div>
                  <StatusPill status="pending" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-ink-2 px-5 py-8 text-sm">
              Nothing pending. Plan a break from{" "}
              <Link className="link" href="/time-off?new=1">
                Time off
              </Link>{" "}
              or file a claim in{" "}
              <Link className="link" href="/expenses?new=1">
                Expenses
              </Link>
              .
            </div>
          )}
        </Panel>
      </div>

      <section aria-label="At a glance" className="panel bg-line grid grid-cols-2 gap-px overflow-hidden sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface px-4 py-4">
            <Stat {...s} />
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Coming up" bodyClassName="p-0">
          <ul className="divide-line divide-y">
            {[
              ...hol
                .slice(0, 2)
                .map((h) => ({
                  key: h.id,
                  icon: <CalendarDays aria-hidden />,
                  title: h.name,
                  sub: h.optional ? "Optional holiday" : "Company holiday",
                  date: h.date,
                })),
              ...upcomingLeave
                .slice(0, 4)
                .map((l) => ({
                  key: l.r.id,
                  icon: <Plane aria-hidden />,
                  title: l.r.employeeId === user.id ? "You're off" : `${l.name} is off`,
                  sub: l.r.startDate < today ? `Back after ${formatDate(l.r.endDate)}` : plural(l.r.days, "day"),
                  date: l.r.startDate < today ? today : l.r.startDate,
                })),
              ...celebrations.map((c) => ({
                key: c.id + c.kind,
                icon: c.kind === "birthday" ? <Cake aria-hidden /> : <PartyPopper aria-hidden />,
                title:
                  c.id === user.id
                    ? c.kind === "birthday"
                      ? "Your birthday"
                      : `Your ${plural(c.years!, "year")} at Northwind`
                    : c.kind === "birthday"
                      ? `${c.name}'s birthday`
                      : `${c.name}, ${plural(c.years!, "year")} at Northwind`,
                sub: c.kind === "birthday" ? "Birthday" : "Work anniversary",
                date: c.date,
              })),
            ]
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 7)
              .map((i) => (
                <li key={i.key} className="flex items-center gap-3 px-5 py-3">
                  <span className="bg-surface-2 text-ink-2 grid size-8 shrink-0 place-items-center rounded-full [&_svg]:size-4">{i.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.title}</p>
                    <p className="text-ink-3 text-xs">{i.sub}</p>
                  </div>
                  <span className="text-ink-2 tabular shrink-0 text-sm">
                    {i.date === today ? "Today" : formatDate(i.date, { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                </li>
              ))}
          </ul>
        </Panel>

        <Panel
          title={myTasks.length ? "Your lifecycle tasks" : "Your goals"}
          action={
            <Link className="link text-sm" href={myTasks.length ? "/lifecycle" : "/performance"}>
              Open
            </Link>
          }
        >
          {myTasks.length ? (
            <ul className="space-y-3">
              {myTasks.map((t) => (
                <li key={t.t.id} className="text-sm">
                  <p className="font-medium">{t.t.title}</p>
                  <p className="text-ink-2">
                    {t.name}, due {formatDate(t.t.dueOn)}
                    {t.t.dueOn < today ? <span className="text-rose ml-1">overdue</span> : null}
                  </p>
                </li>
              ))}
            </ul>
          ) : goalsByObj.size ? (
            <ul className="space-y-4">
              {[...goalsByObj.values()].map((g) => {
                const p = g.progress.reduce((a, b) => a + b, 0) / g.progress.length;
                return (
                  <li key={g.title}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium">{g.title}</span>
                      <span className="text-ink-2 tabular">{Math.round(p * 100)}%</span>
                    </div>
                    <Progress value={p} tone={p >= 0.7 ? "teal" : p >= 0.4 ? "marigold" : "rose"} label={g.title} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-ink-2 text-sm">
              No goals yet this quarter.{" "}
              <Link className="link" href="/performance">
                Set your first goal
              </Link>
              .
            </p>
          )}
        </Panel>

        <Panel
          title="Around the company"
          action={
            <Link className="link text-sm" href="/feed">
              Feed
            </Link>
          }
        >
          {pinned[0] ? (
            <article className="border-line border-b pb-4">
              <p className="font-medium">{pinned[0].a.title}</p>
              <p className="text-ink-2 mt-1 line-clamp-3 text-sm">{pinned[0].a.body}</p>
              <p className="text-ink-3 mt-1.5 text-xs">
                {pinned[0].name}, {timeAgo(pinned[0].a.createdAt)}
              </p>
            </article>
          ) : null}
          <ul className="mt-4 space-y-3">
            {recentKudos.map((k) => (
              <li key={k.k.id} className="flex gap-3 text-sm">
                <Avatar name={k.toName} hue={k.toHue} size={28} />
                <p className="text-ink-2">
                  <span className="text-ink font-medium">{k.fromName.split(" ")[0]}</span> to{" "}
                  <span className="text-ink font-medium">{k.toName.split(" ")[0]}</span>: {k.k.message}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
