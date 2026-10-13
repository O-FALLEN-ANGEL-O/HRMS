import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { requireRole, isPeopleTeam } from "@/lib/auth";
import { holidayDates, leaveBalances, pendingApprovals } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import { ApprovalsBoard, type ApprovalRow } from "./board";
import { formatDate, formatINR, formatTime, isWeekend, plural } from "@/lib/utils";

export const metadata = { title: "Approvals" };

export default async function ApprovalsPage() {
  const user = await requireRole((u) => isPeopleTeam(u) || u.reportCount > 0);
  const db = await getDb();
  const pending = await pendingApprovals(user);
  const hol = await holidayDates();

  // For each leave request, who on the same team (same manager) is already off then.
  const leaveRows: ApprovalRow[] = await Promise.all(
    pending.leave.map(async (a) => {
      const teammates = a.managerId
        ? await db
            .select({ name: schema.employees.name })
            .from(schema.leaveRequests)
            .innerJoin(schema.employees, eq(schema.leaveRequests.employeeId, schema.employees.id))
            .where(
              and(
                eq(schema.employees.managerId, a.managerId),
                inArray(schema.leaveRequests.status, ["approved", "pending"]),
                lte(schema.leaveRequests.startDate, a.r.endDate),
                gte(schema.leaveRequests.endDate, a.r.startDate),
              ),
            )
        : [];
      const others = teammates.map((t) => t.name).filter((n) => n !== a.name);
      const bal = (await leaveBalances(a.r.employeeId, a.r.startDate.slice(0, 4))).find((b) => b.id === a.r.leaveTypeId);
      const holidaysInside = hol.filter((h) => h >= a.r.startDate && h <= a.r.endDate && !isWeekend(h)).length;
      return {
        id: a.r.id,
        kind: "leave" as const,
        name: a.name,
        hue: a.hue,
        title: a.title,
        mine: a.managerId === user.id,
        headline: `${plural(a.r.days, "day")} of ${a.type.toLowerCase()}`,
        detail: `${formatDate(a.r.startDate, { weekday: "short", day: "numeric", month: "short" })}${a.r.endDate !== a.r.startDate ? ` to ${formatDate(a.r.endDate, { weekday: "short", day: "numeric", month: "short" })}` : ""}${holidaysInside ? `, includes ${plural(holidaysInside, "holiday")}` : ""}`,
        reason: a.r.reason,
        createdAt: a.r.createdAt,
        context: [
          bal && bal.code !== "LOP" ? `${bal.remaining + a.r.days} of ${bal.annualQuota} ${bal.code} days available before this` : null,
          others.length ? `Also off then: ${others.join(", ")}` : "Nobody else on the team is off then",
        ].filter(Boolean) as string[],
        warn: others.length >= 2,
      };
    }),
  );

  const regRows: ApprovalRow[] = pending.regularizations.map((a) => ({
    id: a.r.id,
    kind: "regularization",
    name: a.name,
    hue: a.hue,
    title: a.title,
    mine: a.managerId === user.id,
    headline: `Attendance for ${formatDate(a.r.date, { weekday: "short", day: "numeric", month: "short" })}`,
    detail: `${formatTime(a.r.checkIn)} to ${formatTime(a.r.checkOut)}`,
    reason: a.r.reason,
    createdAt: a.r.createdAt,
    context: [],
    warn: false,
  }));

  const expRows: ApprovalRow[] = pending.expenses.map((a) => ({
    id: a.r.id,
    kind: "expense",
    name: a.name,
    hue: a.hue,
    title: a.title,
    mine: a.managerId === user.id,
    headline: `${formatINR(a.r.amount)} for ${a.r.category}`,
    detail: `Spent ${formatDate(a.r.spentOn)}`,
    reason: a.r.description,
    createdAt: a.r.createdAt,
    context: a.r.category === "internet" && a.r.amount > 1000 ? ["Over the ₹1,000 internet limit"] : [],
    warn: a.r.amount >= 5000,
  }));

  return (
    <>
      <PageHeader
        title="Approvals"
        description={
          isPeopleTeam(user)
            ? "Requests from your direct reports come first. As People team, you can also decide for anyone whose manager is away."
            : "Leave, attendance corrections and expense claims from your team."
        }
      />
      <ApprovalsBoard leave={leaveRows} regularizations={regRows} expenses={expRows} peopleTeam={isPeopleTeam(user)} />
    </>
  );
}
