import { and, desc, eq, gte, inArray, lte, ne } from "drizzle-orm";
import { Suspense } from "react";
import { getDb, schema } from "@/db/client";
import { requireUser, isPeopleTeam } from "@/lib/auth";
import { leaveBalances } from "@/lib/queries";
import { PageHeader, Panel } from "@/components/ui";
import { addDays, todayIST } from "@/lib/utils";
import { ApplyLeave, Balances, MyRequests, TeamCalendar } from "./client";

export const metadata = { title: "Time off" };

export default async function TimeOffPage() {
  const user = await requireUser();
  const db = await getDb();
  const today = todayIST();
  const year = today.slice(0, 4);
  const monthStart = `${today.slice(0, 7)}-01`;
  const calStart = addDays(monthStart, -new Date(`${monthStart}T00:00:00Z`).getUTCDay());
  const calEnd = addDays(calStart, 41);

  // Calendar scope: People team sees everyone, managers their reports, others their department.
  const scope = isPeopleTeam(user)
    ? ne(schema.employees.status, "exited")
    : user.reportCount > 0
      ? eq(schema.employees.managerId, user.id)
      : eq(schema.employees.departmentId, user.departmentId ?? "");

  const [balances, types, mine, teamLeave, holidays] = await Promise.all([
    leaveBalances(user.id, year),
    db.select().from(schema.leaveTypes),
    db
      .select({ r: schema.leaveRequests, type: schema.leaveTypes.name, hue: schema.leaveTypes.hue, approver: schema.employees.name })
      .from(schema.leaveRequests)
      .innerJoin(schema.leaveTypes, eq(schema.leaveRequests.leaveTypeId, schema.leaveTypes.id))
      .leftJoin(schema.employees, eq(schema.leaveRequests.approverId, schema.employees.id))
      .where(eq(schema.leaveRequests.employeeId, user.id))
      .orderBy(desc(schema.leaveRequests.startDate)),
    db
      .select({
        id: schema.leaveRequests.id,
        employeeId: schema.leaveRequests.employeeId,
        name: schema.employees.name,
        hue: schema.employees.hue,
        start: schema.leaveRequests.startDate,
        end: schema.leaveRequests.endDate,
        status: schema.leaveRequests.status,
        type: schema.leaveTypes.code,
      })
      .from(schema.leaveRequests)
      .innerJoin(schema.employees, eq(schema.leaveRequests.employeeId, schema.employees.id))
      .innerJoin(schema.leaveTypes, eq(schema.leaveRequests.leaveTypeId, schema.leaveTypes.id))
      .where(
        and(
          scope,
          inArray(schema.leaveRequests.status, ["approved", "pending"]),
          lte(schema.leaveRequests.startDate, addDays(calEnd, 28)),
          gte(schema.leaveRequests.endDate, addDays(calStart, -28)),
        ),
      ),
    db
      .select()
      .from(schema.holidays)
      .where(and(gte(schema.holidays.date, addDays(calStart, -28)), lte(schema.holidays.date, addDays(today, 365))))
      .orderBy(schema.holidays.date),
  ]);

  return (
    <>
      <PageHeader
        title="Time off"
        description="Your balances for this year, your requests, and who's away."
        actions={
          <Suspense>
            <ApplyLeave
              types={types.map((t) => ({ id: t.id, name: t.name, code: t.code }))}
              balances={balances.map((b) => ({ id: b.id, remaining: b.remaining }))}
              today={today}
              holidays={holidays.filter((h) => !h.optional).map((h) => h.date)}
            />
          </Suspense>
        }
      />
      <div className="space-y-6">
        <Balances
          balances={balances.map((b) => ({
            id: b.id,
            name: b.name,
            code: b.code,
            quota: b.annualQuota,
            used: b.used,
            pending: b.pending,
            remaining: b.remaining,
            hue: b.hue,
          }))}
        />
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Panel
            title={isPeopleTeam(user) ? "Who's away" : user.reportCount > 0 ? "Your team's calendar" : `${user.departmentName ?? "Team"} calendar`}
            bodyClassName="p-3 sm:p-5"
          >
            <TeamCalendar
              start={calStart}
              month={today.slice(0, 7)}
              today={today}
              leave={teamLeave}
              holidays={holidays.map((h) => ({ date: h.date, name: h.name }))}
              meId={user.id}
            />
          </Panel>
          <div className="space-y-6">
            <Panel title="Your requests" bodyClassName="p-0">
              <MyRequests
                rows={mine.map((m) => ({
                  id: m.r.id,
                  type: m.type,
                  hue: m.hue,
                  start: m.r.startDate,
                  end: m.r.endDate,
                  days: m.r.days,
                  status: m.r.status,
                  reason: m.r.reason,
                  approver: m.approver,
                  note: m.r.decisionNote,
                }))}
                today={today}
              />
            </Panel>
            <Panel title="Holidays ahead" bodyClassName="p-0">
              <ul className="divide-line divide-y text-sm">
                {holidays
                  .filter((h) => h.date >= today)
                  .slice(0, 6)
                  .map((h) => (
                    <li key={h.id} className="flex justify-between gap-3 px-5 py-2.5">
                      <span>
                        {h.name}
                        {h.optional ? <span className="text-ink-3 ml-2 text-xs">optional</span> : null}
                      </span>
                      <span className="text-ink-2 tabular">
                        {new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(
                          new Date(`${h.date}T00:00:00Z`),
                        )}
                      </span>
                    </li>
                  ))}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
