import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import type { Role } from "@/db/schema";

export const SESSION_COOKIE = "hrp_session";
const SESSION_DAYS = 7;

export type CurrentUser = typeof schema.employees.$inferSelect & {
  departmentName: string | null;
  reportCount: number;
};

export async function createSession(employeeId: string) {
  const db = await getDb();
  const id = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
  await db.insert(schema.sessions).values({ id, employeeId, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroySession() {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (id) {
    const db = await getDb();
    await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
  }
  jar.delete(SESSION_COOKIE);
}

/** The signed-in employee, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const db = await getDb();
  const rows = await db
    .select({ e: schema.employees, departmentName: schema.departments.name })
    .from(schema.sessions)
    .innerJoin(schema.employees, eq(schema.sessions.employeeId, schema.employees.id))
    .leftJoin(schema.departments, eq(schema.employees.departmentId, schema.departments.id))
    .where(and(eq(schema.sessions.id, id), gt(schema.sessions.expiresAt, new Date().toISOString())))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const reports = await db.$count(schema.employees, eq(schema.employees.managerId, row.e.id));
  return { ...row.e, departmentName: row.departmentName, reportCount: reports };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have access to do that.") {
    super(message);
  }
}

/* -------- Permissions -------- */

export const isPeopleTeam = (u: { role: Role }) => u.role === "admin" || u.role === "hr";
export const canManagePeople = isPeopleTeam;
export const canRunPayroll = isPeopleTeam;
export const canManageAssets = isPeopleTeam;
export const canRecruit = (u: { role: Role }) => u.role === "recruiter" || isPeopleTeam(u);
export const canPostAnnouncements = (u: { role: Role }) => isPeopleTeam(u) || u.role === "manager";
export const hasReports = (u: CurrentUser) => u.reportCount > 0;
export const canSeeAnalytics = (u: CurrentUser) => isPeopleTeam(u) || u.role === "manager";

/** Can `user` approve requests (leave, expenses, attendance) raised by `employee`? */
export function canApproveFor(user: CurrentUser, employee: { id: string; managerId: string | null }) {
  if (employee.id === user.id) return false;
  return employee.managerId === user.id || isPeopleTeam(user);
}

export async function requireRole(check: (u: CurrentUser) => boolean): Promise<CurrentUser> {
  const user = await requireUser();
  if (!check(user)) redirect("/home?denied=1");
  return user;
}

export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) throw new ForbiddenError(message);
}
