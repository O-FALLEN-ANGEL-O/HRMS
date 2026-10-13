import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { requireRole, canSeeAnalytics, isPeopleTeam } from "@/lib/auth";
import { holidayDates } from "@/lib/queries";
import { salaryBreakup } from "@/lib/payroll";
import { PageHeader } from "@/components/ui";
import { addDays, daysBetween, formatCompact, isWeekend, todayIST } from "@/lib/utils";
import { Charts } from "./charts";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await requireRole(canSeeAnalytics);
  const db = await getDb();
  const today = todayIST();
  const company = isPeopleTeam(user);

  const allPeople = await db
    .select({ e: schema.employees, dept: schema.departments.name })
    .from(schema.employees)
    .leftJoin(schema.departments, eq(schema.employees.departmentId, schema.departments.id));
  // Managers see their own team (direct reports plus themselves).
  const people = company ? allPeople : allPeople.filter((p) => p.e.managerId === user.id || p.e.id === user.id);
  const ids = people.map((p) => p.e.id);
  const current = people.filter((p) => p.e.status !== "exited" && p.e.joinedOn <= today);

  // Headcount at the end of each of the last 12 months.
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(`${today.slice(0, 7)}-01T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() - (11 - i) + 1);
    d.setUTCDate(0);
    const end = d.toISOString().slice(0, 10);
    return end > today ? today : end;
  });
  const headcount = months.map((end) => ({
    label: new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", month: "short" }).format(new Date(`${end}T00:00:00Z`)),
    value: people.filter((p) => p.e.joinedOn <= end && (!p.e.exitOn || p.e.exitOn > end || p.e.status !== "exited")).length,
  }));

  const byDept = [...new Set(current.map((p) => p.dept ?? "Unassigned"))]
    .map((d) => ({ label: d, value: current.filter((p) => (p.dept ?? "Unassigned") === d).length }))
    .sort((a, b) => b.value - a.value);

  // Attendance: share of expected people clocked in, last 20 working days.
  const hol = await holidayDates();
  const days: string[] = [];
  for (let d = addDays(today, -1); days.length < 20; d = addDays(d, -1)) if (!isWeekend(d) && !hol.includes(d)) days.unshift(d);
  const [att, leave, structures, enps] = await Promise.all([
    ids.length
      ? db
          .select({ date: schema.attendance.date, n: sql<number>`count(*)` })
          .from(schema.attendance)
          .where(and(gte(schema.attendance.date, days[0]!), inArray(schema.attendance.employeeId, ids)))
          .groupBy(schema.attendance.date)
      : [],
    ids.length
      ? db
          .select({
            code: schema.leaveTypes.name,
            start: schema.leaveRequests.startDate,
            end: schema.leaveRequests.endDate,
            days: schema.leaveRequests.days,
            employeeId: schema.leaveRequests.employeeId,
          })
          .from(schema.leaveRequests)
          .innerJoin(schema.leaveTypes, eq(schema.leaveRequests.leaveTypeId, schema.leaveTypes.id))
          .where(and(eq(schema.leaveRequests.status, "approved"), inArray(schema.leaveRequests.employeeId, ids)))
      : [],
    db.select().from(schema.salaryStructures),
    db.select({ s: schema.surveyResponses.score }).from(schema.surveyResponses).where(eq(schema.surveyResponses.surveyId, "srv_enps")),
  ]);
  const attendance = days.map((d) => {
    const expected = current.filter((p) => p.e.joinedOn <= d).length - leave.filter((l) => l.start <= d && l.end >= d).length;
    const n = att.find((a) => a.date === d)?.n ?? 0;
    return {
      label: new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(`${d}T00:00:00Z`)),
      value: expected ? Math.round((Math.min(n, expected) / expected) * 100) : 0,
    };
  });
  const leaveByType = [...new Set(leave.map((l) => l.code))]
    .map((t) => ({ label: t, value: leave.filter((l) => l.code === t && l.start.startsWith(today.slice(0, 4))).reduce((a, l) => a + l.days, 0) }))
    .sort((a, b) => b.value - a.value);

  const exitsLastYear = people.filter((p) => p.e.exitOn && p.e.exitOn <= today && p.e.exitOn > addDays(today, -365)).length;
  const avgHeadcount = headcount.reduce((a, h) => a + h.value, 0) / headcount.length;
  const avgTenure = current.length ? current.reduce((a, p) => a + Math.max(0, daysBetween(p.e.joinedOn, today)), 0) / current.length / 365 : 0;
  const monthlyCost = current.reduce((a, p) => {
    const s = structures.find((x) => x.employeeId === p.e.id);
    return a + (s ? salaryBreakup(s.annualCtc).monthlyCtc : 0);
  }, 0);
  const prom = enps.filter((r) => r.s >= 9).length;
  const det = enps.filter((r) => r.s <= 6).length;

  return (
    <>
      <PageHeader
        title="Analytics"
        description={company ? "Company-wide people numbers, refreshed every time you open this page." : "Numbers for you and your direct reports."}
      />
      <Charts
        tiles={[
          {
            label: "Headcount",
            value: String(current.length),
            sub: `${current.filter((p) => p.e.status === "onboarding").length} joining, ${current.filter((p) => p.e.status === "offboarding").length} leaving`,
          },
          {
            label: "Attrition, last 12 months",
            value: `${avgHeadcount ? Math.round((exitsLastYear / avgHeadcount) * 1000) / 10 : 0}%`,
            sub: `${exitsLastYear} exits`,
          },
          { label: "Average tenure", value: `${avgTenure.toFixed(1)} yrs`, sub: "current employees" },
          { label: "Monthly CTC", value: `₹${formatCompact(monthlyCost)}`, sub: "including employer PF" },
          ...(company
            ? [{ label: "eNPS", value: enps.length ? `${Math.round(((prom - det) / enps.length) * 100)}` : "—", sub: `${enps.length} responses` }]
            : []),
        ]}
        headcount={headcount}
        byDept={byDept}
        attendance={attendance}
        leaveByType={leaveByType}
        company={company}
      />
    </>
  );
}
