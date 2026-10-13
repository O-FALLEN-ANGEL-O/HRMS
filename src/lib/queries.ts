import "server-only";
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { getDb, schema } from "@/db/client";
import { isPeopleTeam, type CurrentUser } from "./auth";

const { employees, leaveRequests, regularizations, expenses, leaveTypes, departments } = schema;

/** IDs of employees whose requests this user can approve. null = everyone (People team). */
export async function approvableEmployeeIds(user: CurrentUser): Promise<string[] | null> {
  if (isPeopleTeam(user)) return null;
  const db = await getDb();
  const rows = await db.select({ id: employees.id }).from(employees).where(eq(employees.managerId, user.id));
  return rows.map((r) => r.id);
}

export async function pendingApprovals(user: CurrentUser) {
  const db = await getDb();
  const ids = await approvableEmployeeIds(user);
  if (ids && ids.length === 0) return { leave: [], regularizations: [], expenses: [] };
  // People team sees everyone's requests except their own; managers see their direct reports'.
  const scope = (col: typeof leaveRequests.employeeId | typeof regularizations.employeeId | typeof expenses.employeeId) =>
    ids ? inArray(col, ids) : ne(col, user.id);

  const emp = alias(employees, "emp");
  const [leave, regs, exps] = await Promise.all([
    db
      .select({ r: leaveRequests, type: leaveTypes.name, typeHue: leaveTypes.hue, name: emp.name, hue: emp.hue, title: emp.title, managerId: emp.managerId })
      .from(leaveRequests)
      .innerJoin(emp, eq(leaveRequests.employeeId, emp.id))
      .innerJoin(leaveTypes, eq(leaveRequests.leaveTypeId, leaveTypes.id))
      .where(and(eq(leaveRequests.status, "pending"), scope(leaveRequests.employeeId)))
      .orderBy(leaveRequests.startDate),
    db
      .select({ r: regularizations, name: emp.name, hue: emp.hue, title: emp.title, managerId: emp.managerId })
      .from(regularizations)
      .innerJoin(emp, eq(regularizations.employeeId, emp.id))
      .where(and(eq(regularizations.status, "pending"), scope(regularizations.employeeId)))
      .orderBy(regularizations.date),
    db
      .select({ r: expenses, name: emp.name, hue: emp.hue, title: emp.title, managerId: emp.managerId })
      .from(expenses)
      .innerJoin(emp, eq(expenses.employeeId, emp.id))
      .where(and(eq(expenses.status, "pending"), scope(expenses.employeeId)))
      .orderBy(desc(expenses.createdAt)),
  ]);
  return { leave, regularizations: regs, expenses: exps };
}

export async function approvalsCount(user: CurrentUser) {
  const p = await pendingApprovals(user);
  return p.leave.length + p.regularizations.length + p.expenses.length;
}

export async function unreadNotifications(userId: string) {
  const db = await getDb();
  return db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.employeeId, userId))
    .orderBy(desc(schema.notifications.createdAt))
    .limit(12);
}

export async function directory() {
  const db = await getDb();
  return db
    .select({
      id: employees.id,
      code: employees.code,
      name: employees.name,
      title: employees.title,
      role: employees.role,
      email: employees.email,
      location: employees.location,
      status: employees.status,
      hue: employees.hue,
      managerId: employees.managerId,
      departmentId: employees.departmentId,
      department: departments.name,
      departmentHue: departments.hue,
      joinedOn: employees.joinedOn,
      birthday: employees.birthday,
      employmentType: employees.employmentType,
    })
    .from(employees)
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .where(ne(employees.status, "exited"))
    .orderBy(employees.name);
}

export type DirectoryRow = Awaited<ReturnType<typeof directory>>[number];

/** Leave used per type for the calendar year of `year`. */
export async function leaveBalances(employeeId: string, year: string) {
  const db = await getDb();
  const types = await db.select().from(leaveTypes);
  const used = await db
    .select({ typeId: leaveRequests.leaveTypeId, status: leaveRequests.status, days: sql<number>`sum(${leaveRequests.days})` })
    .from(leaveRequests)
    .where(and(eq(leaveRequests.employeeId, employeeId), inArray(leaveRequests.status, ["approved", "pending"]), sql`substr(${leaveRequests.startDate},1,4) = ${year}`))
    .groupBy(leaveRequests.leaveTypeId, leaveRequests.status);
  return types.map((t) => {
    const approved = used.find((u) => u.typeId === t.id && u.status === "approved")?.days ?? 0;
    const pending = used.find((u) => u.typeId === t.id && u.status === "pending")?.days ?? 0;
    return { ...t, used: approved, pending, remaining: t.annualQuota - approved - pending };
  });
}

export async function notify(employeeId: string, title: string, href?: string) {
  const db = await getDb();
  await db.insert(schema.notifications).values({ id: `nt_${crypto.randomUUID().slice(0, 12)}`, employeeId, title, href: href ?? null });
}

export async function audit(actorId: string, action: string, entity: string, entityId: string, detail?: unknown) {
  const db = await getDb();
  await db.insert(schema.auditLog).values({
    id: `au_${crypto.randomUUID().slice(0, 12)}`,
    actorId,
    action,
    entity,
    entityId,
    detail: detail === undefined ? null : JSON.stringify(detail),
  });
}

export async function holidayDates() {
  const db = await getDb();
  const rows = await db.select({ date: schema.holidays.date }).from(schema.holidays).where(eq(schema.holidays.optional, false));
  return rows.map((r) => r.date);
}
