import Link from "next/link";
import { and, desc, eq, gte, inArray, lte, ne, sql } from "drizzle-orm";
import {
  BriefcaseBusiness,
  CalendarDays,
  CalendarPlus,
  Cake,
  Heart,
  Inbox,
  LifeBuoy,
  PartyPopper,
  Plane,
  Receipt,
  Smile,
  Sparkles,
  Ticket,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { alias } from "drizzle-orm/sqlite-core";
import { getDb, schema } from "@/db/client";
import { requireUser, isPeopleTeam, type CurrentUser } from "@/lib/auth";
import { leaveBalances, pendingApprovals } from "@/lib/queries";
import { ClockCard } from "@/components/clock-card";
import { Avatar, StatusPill } from "@/components/ui";
import { Bento, DayBars, HeroChip, KpiTile, LiveClock, QuickAction, Ring, Tile, type DayBar, type Tone } from "@/components/dashboard";
import { addDays, cn, formatDate, formatINR, isWeekend, monthLabel, plural, timeAgo, todayIST } from "@/lib/utils";

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
  return h < 5 ? "Working late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** The last `n` working days up to and including today (weekends skipped). */
function lastWorkdays(today: string, n: number) {
  const out: string[] = [];
  for (let d = today; out.length < n; d = addDays(d, -1)) if (!isWeekend(d)) out.unshift(d);
  return out;
}

type Kpi = { label: string; value: string | number; sub?: string; href: string; series?: number[]; ring?: number; tone?: Tone; icon?: React.ReactNode };

/**
 * Attendance over the last two working weeks for whoever this person looks after:
 * everyone (People team), their reports (managers) or just themselves.
 */
async function fortnight(user: CurrentUser, today: string, holidayDates: string[]) {
  const db = await getDb();
  const days = lastWorkdays(today, 10);
  const from = days[0]!;
  const scope = isPeopleTeam(user) ? "company" : user.reportCount > 0 ? "team" : "me";

  let ids: string[] | null = null;
  if (scope === "team") ids = (await db.select({ id: employees.id }).from(employees).where(eq(employees.managerId, user.id))).map((r) => r.id);
  if (scope === "me") ids = [user.id];

  const [att, lv, head] = await Promise.all([
    db
      .select({ employeeId: attendance.employeeId, date: attendance.date, checkIn: attendance.checkIn, checkOut: attendance.checkOut })
      .from(attendance)
      .where(and(gte(attendance.date, from), lte(attendance.date, today), ids ? inArray(attendance.employeeId, ids.length ? ids : ["-"]) : undefined)),
    db
      .select({ employeeId: leaveRequests.employeeId, startDate: leaveRequests.startDate, endDate: leaveRequests.endDate })
      .from(leaveRequests)
      .where(
        and(
          eq(leaveRequests.status, "approved"),
          lte(leaveRequests.startDate, today),
          gte(leaveRequests.endDate, from),
          ids ? inArray(leaveRequests.employeeId, ids.length ? ids : ["-"]) : undefined,
        ),
      ),
    ids ? Promise.resolve(ids.length) : db.$count(employees, ne(employees.status, "exited")),
  ]);

  const bars: DayBar[] = days.map((d) => {
    const rows = att.filter((a) => a.date === d && a.checkIn);
    const out = lv.filter((l) => l.startDate <= d && l.endDate >= d).length;
    const holiday = holidayDates.includes(d);
    const base = { date: d, label: formatDate(d, { weekday: "narrow" }), today: d === today, muted: holiday };
    const when = d === today ? "Today" : formatDate(d, { weekday: "short", day: "numeric", month: "short" });
    if (scope === "me") {
      const r = rows[0];
      const end = r?.checkOut ?? (d === today && r?.checkIn ? new Date().toISOString() : null);
      const hours = r?.checkIn && end ? Math.max(0, Date.parse(end) - Date.parse(r.checkIn)) / 3_600_000 : 0;
      return { ...base, value: Math.round(hours * 10) / 10, note: holiday ? `${when}, holiday` : out ? `${when}, on leave` : when };
    }
    return { ...base, value: rows.length, secondary: out, note: holiday ? `${when}, holiday` : when };
  });

  const worked = bars.filter((b) => b.value > 0 && !b.today);
  const avg = worked.length ? worked.reduce((s, b) => s + b.value, 0) / worked.length : 0;
  return { scope, bars, head, avg, max: scope === "me" ? Math.max(10, ...bars.map((b) => b.value)) : Math.max(head, 1) };
}

async function roleKpis(user: CurrentUser, today: string, trend: Awaited<ReturnType<typeof fortnight>>): Promise<Kpi[]> {
  const db = await getDb();
  const month = today.slice(0, 7);
  const presentSeries = trend.bars.filter((b) => !b.muted).map((b) => b.value);

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
      {
        label: "In today",
        value: `${present}/${headcount}`,
        sub: `${onLeave} on leave`,
        href: "/attendance",
        series: presentSeries,
        tone: "teal",
        icon: <Users />,
      },
      {
        label: `Payroll, ${monthLabel(month).split(" ")[0]}`,
        value: run ? (run.status === "finalized" ? "Paid" : "Draft") : "Not run",
        sub: run ? (run.status === "finalized" ? "payslips published" : "review and finalize") : "ready to run",
        href: "/payroll",
        tone: run?.status === "finalized" ? "teal" : "marigold",
        ring: run ? (run.status === "finalized" ? 1 : 0.6) : 0.05,
        icon: <Wallet />,
      },
      { label: "Open tickets", value: openTickets, sub: "across all desks", href: "/helpdesk", tone: openTickets > 6 ? "rose" : "sky", icon: <LifeBuoy /> },
      { label: "Joiners & leavers", value: joining, sub: "checklists in progress", href: "/lifecycle", tone: "sky", icon: <UserPlus /> },
      {
        label: "eNPS",
        value: enpsScore === null ? "—" : enpsScore > 0 ? `+${enpsScore}` : enpsScore,
        sub: `${plural(enps.length, "response")}`,
        href: "/surveys",
        tone: (enpsScore ?? 0) >= 30 ? "teal" : (enpsScore ?? 0) >= 0 ? "marigold" : "rose",
        ring: enpsScore === null ? 0 : (enpsScore + 100) / 200,
        icon: <Smile />,
      },
    ];
  }

  if (user.role === "recruiter") {
    const [open, active, fresh, offers, recent] = await Promise.all([
      db.$count(jobs, eq(jobs.status, "open")),
      db.$count(candidates, inArray(candidates.stage, ["screening", "interview", "offer"])),
      db.$count(candidates, eq(candidates.stage, "applied")),
      db.$count(candidates, eq(candidates.stage, "offer")),
      db
        .select({ at: candidates.createdAt })
        .from(candidates)
        .where(gte(candidates.createdAt, addDays(today, -14))),
    ]);
    const perDay = lastWorkdays(today, 10).map((d) => recent.filter((r) => r.at.slice(0, 10) === d).length);
    return [
      { label: "New applicants", value: fresh, sub: "waiting to be screened", href: "/recruitment", series: perDay, tone: "marigold", icon: <Inbox /> },
      { label: "In process", value: active, sub: "screening to offer", href: "/recruitment", tone: "sky", icon: <Users /> },
      { label: "Open roles", value: open, sub: "hiring now", href: "/recruitment", tone: "teal", icon: <BriefcaseBusiness /> },
      {
        label: "Offers out",
        value: offers,
        sub: "awaiting answers",
        href: "/recruitment",
        tone: "teal",
        ring: active ? offers / active : 0,
        icon: <PartyPopper />,
      },
    ];
  }

  const [balances, lastSlip] = await Promise.all([
    leaveBalances(user.id, today.slice(0, 4)),
    db
      .select({ net: payslips.net, month: payrollRuns.month })
      .from(payslips)
      .innerJoin(payrollRuns, eq(payslips.runId, payrollRuns.id))
      .where(and(eq(payslips.employeeId, user.id), eq(payrollRuns.status, "finalized")))
      .orderBy(desc(payrollRuns.month))
      .limit(1),
  ]);
  const kpis: Kpi[] = [];
  if (user.reportCount > 0) {
    const todayBar = trend.bars.find((b) => b.today);
    kpis.push({
      label: "Your team today",
      value: `${todayBar?.value ?? 0}/${trend.head}`,
      sub: `${todayBar?.secondary ?? 0} on leave`,
      href: "/attendance",
      series: presentSeries,
      tone: "teal",
      icon: <Users />,
    });
  } else {
    const hrs = trend.bars.filter((b) => !b.muted && !b.today && b.value > 0).map((b) => b.value);
    kpis.push({
      label: "Average day",
      value: trend.avg ? `${Math.floor(trend.avg)}h ${String(Math.round((trend.avg % 1) * 60)).padStart(2, "0")}m` : "—",
      sub: "last two weeks",
      href: "/attendance",
      series: hrs,
      tone: "sky",
      icon: <CalendarDays />,
    });
  }
  const tones: Tone[] = ["teal", "sky", "marigold"];
  balances
    .filter((b) => b.code !== "LOP" && b.annualQuota > 0)
    .slice(0, 3)
    .forEach((b, i) =>
      kpis.push({
        label: b.name,
        value: b.remaining,
        sub: `of ${b.annualQuota} days left${b.pending ? `, ${b.pending} pending` : ""}`,
        href: "/time-off",
        ring: b.remaining / b.annualQuota,
        tone: tones[i % tones.length],
        icon: <Plane />,
      }),
    );
  if (lastSlip[0])
    kpis.push({
      label: "Last payslip",
      value: formatINR(lastSlip[0].net),
      sub: monthLabel(lastSlip[0].month),
      href: "/payroll",
      tone: "teal",
      icon: <Wallet />,
    });
  return kpis;
}

function quickActions(user: CurrentUser) {
  const all = {
    leave: { href: "/time-off?new=1", icon: <CalendarPlus />, label: "Apply for time off", hint: "Half days and holidays counted for you" },
    expense: { href: "/expenses?new=1", icon: <Receipt />, label: "File an expense", hint: "Paid with the next payroll" },
    ticket: { href: "/helpdesk?new=1", icon: <Ticket />, label: "Raise a ticket", hint: "Sorted to the right team" },
    assistant: { href: "/assistant", icon: <Sparkles />, label: "Ask HR assistant", hint: "Answers from company policy" },
    payroll: { href: "/payroll", icon: <Wallet />, label: "Run payroll", hint: "PF, ESI, PT and TDS checked" },
    person: { href: "/people?add=1", icon: <UserPlus />, label: "Add a person", hint: "Onboarding checklist included" },
    kudos: { href: "/feed?kudos=1", icon: <Heart />, label: "Give kudos", hint: "Thank someone in public" },
    pipeline: { href: "/recruitment", icon: <BriefcaseBusiness />, label: "Open the pipeline", hint: "Score and move candidates" },
  };
  if (isPeopleTeam(user)) return [all.payroll, all.person, all.ticket, all.assistant];
  if (user.role === "recruiter") return [all.pipeline, all.leave, all.kudos, all.assistant];
  if (user.reportCount > 0) return [all.leave, all.kudos, all.expense, all.assistant];
  return [all.leave, all.expense, all.ticket, all.assistant];
}

export default async function HomePage() {
  const user = await requireUser();
  const db = await getDb();
  const today = todayIST();
  const weekAhead = addDays(today, 14);

  const [todayRow, approvals, myPending, hol, upcomingLeave, people, pinned, recentKudos, goals, myTasks, holidayRows] = await Promise.all([
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
    db
      .select({ date: holidays.date })
      .from(holidays)
      .where(and(eq(holidays.optional, false), gte(holidays.date, addDays(today, -21)), lte(holidays.date, today))),
  ]);

  const trend = await fortnight(
    user,
    today,
    holidayRows.map((h) => h.date),
  );
  const kpis = await roleKpis(user, today, trend);

  const onLeaveToday = upcomingLeave.find((l) => l.r.employeeId === user.id && l.r.startDate <= today && l.r.endDate >= today);
  const holidayToday = hol.find((h) => h.date === today && !h.optional);
  const nextHoliday = hol.find((h) => h.date > today && !h.optional);
  const outToday = upcomingLeave.filter((l) => l.r.startDate <= today && l.r.endDate >= today && l.r.employeeId !== user.id).length;

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

  const waitingItems = [
    ...approvals.leave.map((a) => ({
      id: a.r.id,
      name: a.name,
      hue: a.hue,
      kind: "Leave",
      what: `${a.r.days === 1 ? "1 day" : `${a.r.days} days`} ${a.type.toLowerCase()}, from ${formatDate(a.r.startDate)}`,
      when: a.r.createdAt,
    })),
    ...approvals.regularizations.map((a) => ({
      id: a.r.id,
      name: a.name,
      hue: a.hue,
      kind: "Attendance",
      what: `Correction for ${formatDate(a.r.date)}`,
      when: a.r.createdAt,
    })),
    ...approvals.expenses.map((a) => ({
      id: a.r.id,
      name: a.name,
      hue: a.hue,
      kind: "Expense",
      what: `${formatINR(a.r.amount)} ${a.r.category}`,
      when: a.r.createdAt,
    })),
  ]
    .sort((a, b) => b.when.localeCompare(a.when))
    .slice(0, 5);

  const comingUp = [
    ...hol.slice(0, 2).map((h) => ({
      key: h.id,
      icon: <CalendarDays aria-hidden />,
      tone: "sky" as const,
      title: h.name,
      sub: h.optional ? "Optional holiday" : "Company holiday",
      date: h.date,
    })),
    ...upcomingLeave.slice(0, 4).map((l) => ({
      key: l.r.id,
      icon: <Plane aria-hidden />,
      tone: "teal" as const,
      title: l.r.employeeId === user.id ? "You're off" : `${l.name} is off`,
      sub: l.r.startDate < today ? `Back after ${formatDate(l.r.endDate)}` : plural(l.r.days, "day"),
      date: l.r.startDate < today ? today : l.r.startDate,
    })),
    ...celebrations.map((c) => ({
      key: c.id + c.kind,
      icon: c.kind === "birthday" ? <Cake aria-hidden /> : <PartyPopper aria-hidden />,
      tone: "marigold" as const,
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
    .slice(0, 6);

  const toneBg = { sky: "bg-sky-soft text-sky", teal: "bg-teal-soft text-teal", marigold: "bg-marigold-soft text-marigold-ink" };
  const odd = kpis.length % 2 === 1;
  const trendTitle =
    trend.scope === "company" ? "Attendance, last two weeks" : trend.scope === "team" ? "Your team, last two weeks" : "Your hours, last two weeks";

  return (
    <Bento>
      {/* ---------- Hero ---------- */}
      <Tile className="col-span-12" bodyClassName="p-5 sm:p-7" glow="var(--sky)">
        <div className="hero-aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="hero-grid" aria-hidden />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <p className="text-ink-2 flex items-center gap-2 text-sm">
              <span className="bg-teal live-dot inline-block size-2 rounded-full" aria-hidden />
              {formatDate(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <h1 className="mt-2 text-4xl sm:text-5xl">
              {greeting()}, <span className="text-marigold-ink">{first}</span>
            </h1>
            <div className="mt-3">
              <LiveClock />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {waiting ? (
                <HeroChip href="/approvals" tone="marigold">
                  <Inbox aria-hidden /> {plural(waiting, "request")} waiting on you
                </HeroChip>
              ) : null}
              {myPending.length ? (
                <HeroChip href="/time-off">
                  <Plane aria-hidden /> {plural(myPending.length, "request")} of yours pending
                </HeroChip>
              ) : null}
              {holidayToday ? (
                <HeroChip href="/time-off">
                  <PartyPopper aria-hidden /> {holidayToday.name} today
                </HeroChip>
              ) : nextHoliday ? (
                <HeroChip href="/time-off">
                  <CalendarDays aria-hidden /> {nextHoliday.name}, {formatDate(nextHoliday.date, { weekday: "short", day: "numeric", month: "short" })}
                </HeroChip>
              ) : null}
              {outToday ? (
                <HeroChip href="/time-off">
                  <Users aria-hidden /> {outToday} out today
                </HeroChip>
              ) : null}
            </div>
          </div>
          <nav aria-label="Quick actions" className="grid gap-2.5 sm:grid-cols-2">
            {quickActions(user).map((a) => (
              <QuickAction key={a.label} {...a} />
            ))}
          </nav>
        </div>
      </Tile>

      {/* ---------- Clock + KPIs ---------- */}
      <Tile className="col-span-12 lg:col-span-5" bodyClassName="flex items-center p-6">
        <ClockCard
          today={todayRow ? { checkIn: todayRow.checkIn, checkOut: todayRow.checkOut, mode: todayRow.mode } : null}
          isWorkday={!isWeekend(today) && !holidayToday}
          holiday={holidayToday ? `Holiday: ${holidayToday.name}` : null}
          onLeave={onLeaveToday ? "You're on leave today" : null}
        />
      </Tile>

      <div className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-7 lg:gap-5" role="group" aria-label="At a glance">
        {kpis.map((k, i) => (
          <KpiTile key={k.label} {...k} className={cn(odd && i === 0 && "col-span-2")} />
        ))}
      </div>

      {/* ---------- Trend + inbox ---------- */}
      <Tile
        className="col-span-12 lg:col-span-7"
        title={trendTitle}
        action={{ label: "Attendance", href: "/attendance" }}
        glow="var(--teal)"
        bodyClassName="flex flex-col"
      >
        <DayBars
          data={trend.bars}
          max={trend.max}
          unit={trend.scope === "me" ? "hours" : `of ${trend.head} in`}
          primaryLabel={trend.scope === "me" ? "Hours worked" : "Clocked in"}
          secondaryLabel={trend.scope === "me" ? undefined : "on leave"}
          tone="teal"
        />
      </Tile>

      <Tile
        className="col-span-12 lg:col-span-5"
        bodyClassName="p-0"
        title={waiting ? "Waiting on you" : "Your requests"}
        action={waiting ? { label: "Review all", href: "/approvals" } : { label: "Time off", href: "/time-off" }}
      >
        {waiting ? (
          <ul className="divide-line divide-y">
            {waitingItems.map((i) => (
              <li key={i.id}>
                <Link href="/approvals" className="hover:bg-surface-2/60 flex items-center gap-3 px-5 py-3 transition-colors">
                  <Avatar name={i.name} hue={i.hue} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.name}</p>
                    <p className="text-ink-2 truncate text-sm">{i.what}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="bg-surface-2 text-ink-2 inline-block rounded-full px-2 py-0.5 text-[0.7rem] font-medium">{i.kind}</span>
                    <span className="text-ink-3 mt-0.5 block text-xs">{timeAgo(i.when)}</span>
                  </div>
                </Link>
              </li>
            ))}
            {waiting > 5 ? (
              <li>
                <Link href="/approvals" className="text-ink-2 hover:text-ink block px-5 py-3 text-sm">
                  and {plural(waiting - 5, "more request")}
                </Link>
              </li>
            ) : null}
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
      </Tile>

      {/* ---------- Coming up / goals / company ---------- */}
      <Tile className="col-span-12 md:col-span-6 xl:col-span-4" bodyClassName="p-0" title="Coming up" glow="var(--sky)">
        {comingUp.length ? (
          <ol className="relative px-5 pb-3">
            <span className="bg-line absolute top-3 bottom-6 left-[2.55rem] w-px" aria-hidden />
            {comingUp.map((i) => (
              <li key={i.key} className="relative flex items-center gap-3 py-2.5">
                <span className="tabular border-line bg-surface w-10 shrink-0 rounded-lg border py-1 text-center leading-none">
                  <span className="text-ink-3 block text-[0.62rem] uppercase">{formatDate(i.date, { month: "short" })}</span>
                  <span className="font-display block text-base font-semibold">{Number(i.date.slice(8))}</span>
                </span>
                <span className={cn("relative grid size-7 shrink-0 place-items-center rounded-full [&_svg]:size-3.5", toneBg[i.tone])}>{i.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{i.title}</p>
                  <p className="text-ink-3 text-xs">
                    {i.date === today ? "Today · " : ""}
                    {i.sub}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-ink-2 px-5 pb-5 text-sm">A quiet fortnight: no holidays, leave or birthdays coming up.</p>
        )}
      </Tile>

      <Tile
        className="col-span-12 md:col-span-6 xl:col-span-4"
        title={myTasks.length ? "Your lifecycle tasks" : "Your goals"}
        action={{ label: "Open", href: myTasks.length ? "/lifecycle" : "/performance" }}
        glow="var(--teal)"
      >
        {myTasks.length ? (
          <ul className="space-y-2">
            {myTasks.map((t) => (
              <li key={t.t.id} className="border-line flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", t.t.dueOn < today ? "bg-rose" : "bg-marigold")} aria-hidden />
                <div className="min-w-0">
                  <p className="font-medium">{t.t.title}</p>
                  <p className="text-ink-2">
                    {t.name}, due {formatDate(t.t.dueOn)}
                    {t.t.dueOn < today ? <span className="text-rose ml-1">overdue</span> : null}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : goalsByObj.size ? (
          <ul className="space-y-3">
            {[...goalsByObj.entries()].map(([id, g]) => {
              const p = g.progress.reduce((a, b) => a + b, 0) / g.progress.length;
              const tone: Tone = p >= 0.7 ? "teal" : p >= 0.4 ? "marigold" : "rose";
              return (
                <li key={id} className="flex items-center gap-3">
                  <Ring value={p} size={48} stroke={5} tone={tone} label={g.title}>
                    <span className="tabular text-xs font-semibold">{Math.round(p * 100)}%</span>
                  </Ring>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium">{g.title}</p>
                    <p className="text-ink-3 text-xs">{plural(g.progress.length, "key result")}</p>
                  </div>
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
      </Tile>

      <Tile className="col-span-12 xl:col-span-4" title="Around the company" action={{ label: "Feed", href: "/feed" }}>
        {pinned[0] ? (
          <article className="bg-surface-2/60 rounded-xl p-4">
            <p className="text-marigold-ink text-xs font-semibold tracking-wide uppercase">{pinned[0].a.pinned ? "Pinned" : "Latest"}</p>
            <p className="mt-1 font-medium">{pinned[0].a.title}</p>
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
      </Tile>
    </Bento>
  );
}
