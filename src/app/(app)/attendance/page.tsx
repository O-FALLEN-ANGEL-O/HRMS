import Link from "next/link";
import { Suspense } from "react";
import { and, desc, eq, gte, lte, inArray, ne } from "drizzle-orm";
import { Download } from "lucide-react";
import { getDb, schema } from "@/db/client";
import { requireUser, isPeopleTeam } from "@/lib/auth";
import { holidayDates } from "@/lib/queries";
import { ClockCard } from "@/components/clock-card";
import { Avatar, Button, PageHeader, Panel, Pill, StatusPill } from "@/components/ui";
import { addDays, formatDate, formatTime, isWeekend, todayIST } from "@/lib/utils";
import { CorrectionDialog, MonthGrid } from "./client";

export const metadata = { title: "Attendance" };

export default async function AttendancePage() {
  const user = await requireUser();
  const db = await getDb();
  const today = todayIST();
  const month = today.slice(0, 7);
  const monthStart = `${month}-01`;

  const [rows, leave, hol, corrections] = await Promise.all([
    db.select().from(schema.attendance).where(and(eq(schema.attendance.employeeId, user.id), gte(schema.attendance.date, addDays(monthStart, -7)))),
    db
      .select()
      .from(schema.leaveRequests)
      .where(and(eq(schema.leaveRequests.employeeId, user.id), eq(schema.leaveRequests.status, "approved"), gte(schema.leaveRequests.endDate, monthStart))),
    holidayDates(),
    db.select().from(schema.regularizations).where(eq(schema.regularizations.employeeId, user.id)).orderBy(desc(schema.regularizations.createdAt)).limit(6),
  ]);

  const todayRow = rows.find((r) => r.date === today) ?? null;
  const days: { date: string; state: "office" | "remote" | "field" | "leave" | "holiday" | "missing" | "weekend" | "future" | "partial"; hours: number | null; checkIn: string | null; checkOut: string | null }[] = [];
  for (let d = monthStart; d.slice(0, 7) === month; d = addDays(d, 1)) {
    const r = rows.find((x) => x.date === d);
    const onLeave = leave.some((l) => l.startDate <= d && l.endDate >= d);
    const hours = r?.checkIn && r.checkOut ? (Date.parse(r.checkOut) - Date.parse(r.checkIn)) / 3_600_000 : null;
    const state = d > today ? "future" : isWeekend(d) ? "weekend" : hol.includes(d) ? "holiday" : onLeave ? "leave" : r?.checkIn ? (r.checkOut || d === today ? r.mode : "partial") : d === today ? "future" : "missing";
    days.push({ date: d, state, hours, checkIn: r?.checkIn ?? null, checkOut: r?.checkOut ?? null });
  }
  const worked = days.filter((d) => d.hours !== null);
  const avg = worked.length ? worked.reduce((s, d) => s + d.hours!, 0) / worked.length : 0;
  const late = days.filter((d) => d.checkIn && (new Date(d.checkIn).getUTCHours() * 60 + new Date(d.checkIn).getUTCMinutes() + 330) % 1440 > 11 * 60).length;
  const missing = days.filter((d) => d.state === "missing" || d.state === "partial");

  // Team today (managers see reports, People team sees everyone)
  const showTeam = isPeopleTeam(user) || user.reportCount > 0;
  let team: { id: string; name: string; hue: number; title: string; checkIn: string | null; checkOut: string | null; mode: string | null; leave: boolean }[] = [];
  if (showTeam) {
    const people = await db
      .select({ id: schema.employees.id, name: schema.employees.name, hue: schema.employees.hue, title: schema.employees.title })
      .from(schema.employees)
      .where(isPeopleTeam(user) ? ne(schema.employees.status, "exited") : eq(schema.employees.managerId, user.id))
      .orderBy(schema.employees.name);
    const ids = people.map((p) => p.id);
    const [att, lv] = await Promise.all([
      ids.length ? db.select().from(schema.attendance).where(and(eq(schema.attendance.date, today), inArray(schema.attendance.employeeId, ids))) : [],
      ids.length
        ? db.select({ employeeId: schema.leaveRequests.employeeId }).from(schema.leaveRequests).where(and(inArray(schema.leaveRequests.employeeId, ids), eq(schema.leaveRequests.status, "approved"), lte(schema.leaveRequests.startDate, today), gte(schema.leaveRequests.endDate, today)))
        : [],
    ]);
    team = people
      .filter((p) => p.id !== user.id)
      .map((p) => {
        const a = att.find((x) => x.employeeId === p.id);
        return { ...p, checkIn: a?.checkIn ?? null, checkOut: a?.checkOut ?? null, mode: a?.mode ?? null, leave: lv.some((l) => l.employeeId === p.id) };
      });
  }
  const inCount = team.filter((t) => t.checkIn).length;

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Clock in when you start, out when you finish. Core hours are 11:00 to 16:00 IST."
        actions={
          <>
            {isPeopleTeam(user) ? (
              <Button asChild variant="outline">
                <a href={`/api/export/attendance?month=${month}`} download>
                  <Download aria-hidden /> Export {formatDate(monthStart, { month: "long" })}
                </a>
              </Button>
            ) : null}
            <Suspense>
              <CorrectionDialog today={today} suggest={missing.at(-1)?.date ?? addDays(today, -1)} />
            </Suspense>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel className="flex flex-col" bodyClassName="flex flex-1 items-center p-6">
          <ClockCard today={todayRow ? { checkIn: todayRow.checkIn, checkOut: todayRow.checkOut, mode: todayRow.mode } : null} isWorkday={!isWeekend(today) && !hol.includes(today)} holiday={hol.includes(today) ? "Company holiday" : null} />
        </Panel>
        <Panel title={formatDate(monthStart, { month: "long", year: "numeric" })}>
          <MonthGrid days={days} today={today} />
          <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-4 text-sm">
            <div>
              <dt className="text-ink-2">Average day</dt>
              <dd className="font-display text-xl font-semibold tabular">{avg ? `${Math.floor(avg)}h ${String(Math.round((avg % 1) * 60)).padStart(2, "0")}m` : "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-2">After 11:00</dt>
              <dd className="font-display text-xl font-semibold tabular">{late}</dd>
            </div>
            <div>
              <dt className="text-ink-2">To correct</dt>
              <dd className={`font-display text-xl font-semibold tabular ${missing.length ? "text-rose" : ""}`}>{missing.length}</dd>
            </div>
          </dl>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        {showTeam ? (
          <Panel title={`${isPeopleTeam(user) ? "Everyone" : "Your team"} today`} action={<span className="text-sm text-ink-2 tabular">{inCount} of {team.length} in</span>} bodyClassName="p-0">
            <ul className="max-h-[420px] divide-y divide-line overflow-y-auto">
              {team.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-5 py-2.5">
                  <Avatar name={t.name} hue={t.hue} size={30} />
                  <Link href={`/people/${t.id}`} className="min-w-0 flex-1 text-sm hover:underline">
                    <span className="block truncate font-medium">{t.name}</span>
                    <span className="block truncate text-xs text-ink-3">{t.title}</span>
                  </Link>
                  {t.leave ? (
                    <Pill t="good">On leave</Pill>
                  ) : t.checkIn ? (
                    <span className="text-right text-sm tabular">
                      {formatTime(t.checkIn)}
                      {t.checkOut ? ` – ${formatTime(t.checkOut)}` : ""}
                      <span className="block text-xs text-ink-3 capitalize">{t.mode}</span>
                    </span>
                  ) : (
                    <Pill>Not in yet</Pill>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}
        <Panel title="Your corrections" bodyClassName="p-0" className={showTeam ? "" : "xl:col-span-2"}>
          {corrections.length ? (
            <ul className="divide-y divide-line">
              {corrections.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {formatDate(c.date, { weekday: "short", day: "numeric", month: "short" })}, {formatTime(c.checkIn)} to {formatTime(c.checkOut)}
                    </p>
                    <p className="text-ink-2">{c.reason}</p>
                  </div>
                  <StatusPill status={c.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-ink-2">Forgot to clock in or out? Raise a correction for any of the last 7 days and your manager will review it.</p>
          )}
        </Panel>
      </div>
    </>
  );
}
