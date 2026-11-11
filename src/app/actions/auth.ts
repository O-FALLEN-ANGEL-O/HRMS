"use server";

import { redirect } from "next/navigation";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db/client";
import { DEMO_LOGINS } from "@/db/seed";
import { assert, createSession, destroySession, isPeopleTeam, requireUser } from "@/lib/auth";
import { formObject, run, UserError } from "@/lib/action";
import { appUrl, compose, isDemoMode, sendEmail } from "@/lib/email";
import { hashPassword, passwordProblem, randomToken, sha256Hex, verifyPassword } from "@/lib/password";
import { audit } from "@/lib/queries";
import { newId } from "@/lib/utils";

const { employees, credentials, authTokens, loginAttempts, sessions } = schema;

const MAX_FAILURES = 8; // per email, per 15 minutes
const WINDOW_MS = 15 * 60_000;
const TOKEN_TTL = { invite: 7 * 86_400_000, reset: 60 * 60_000 } as const;

/** Demo only: sign in as a sample person without a password. */
export async function signInAs(formData: FormData) {
  if (!(await isDemoMode())) redirect("/?error=demo-off");
  const role = String(formData.get("role") ?? "");
  const code = String(formData.get("code") ?? "") || DEMO_LOGINS[role as keyof typeof DEMO_LOGINS];
  if (!code) redirect("/?error=unknown");
  const db = await getDb();
  const emp = await db.query.employees.findFirst({ where: eq(employees.code, code) });
  if (!emp || emp.status === "exited") redirect("/?error=unknown");
  await createSession(emp.id);
  redirect("/home");
}

const emailSchema = z.string().trim().toLowerCase().email("Enter your work email.").max(200);

async function findByEmail(email: string) {
  const db = await getDb();
  return db.query.employees.findFirst({ where: sql`lower(${employees.email}) = ${email}` });
}

export async function signInWithPassword(_: unknown, fd: FormData) {
  const result = await run(async () => {
    const v = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password.").max(200) }).parse(formObject(fd));
    const db = await getDb();
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const failures = await db.$count(loginAttempts, and(eq(loginAttempts.email, v.email), gt(loginAttempts.createdAt, since)));
    if (failures >= MAX_FAILURES) throw new UserError("Too many tries. Wait 15 minutes, or reset your password.");

    const emp = await findByEmail(v.email);
    const cred = emp && emp.status !== "exited" ? await db.query.credentials.findFirst({ where: eq(credentials.employeeId, emp.id) }) : null;
    // Always run one hash so a wrong email takes as long as a wrong password.
    const ok = await verifyPassword(v.password, cred?.passwordHash ?? "pbkdf2-sha256$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAA");
    if (!emp || !cred || !ok) {
      await db.insert(loginAttempts).values({ id: newId("la"), email: v.email });
      throw new UserError(
        emp && !cred && emp.status !== "exited"
          ? "You haven't set a password yet. Use the link in your invite email, or reset it below."
          : "That email and password don't match.",
      );
    }
    await db.delete(loginAttempts).where(eq(loginAttempts.email, v.email));
    await createSession(emp.id);
    await audit(emp.id, "auth.sign_in", "employee", emp.id);
  });
  if (result.ok) redirect("/home");
  return result;
}

async function issueToken(employeeId: string, purpose: "invite" | "reset") {
  const db = await getDb();
  const token = randomToken();
  // A new link replaces any older unused one of the same kind.
  await db.delete(authTokens).where(and(eq(authTokens.employeeId, employeeId), eq(authTokens.purpose, purpose), isNull(authTokens.usedAt)));
  await db.insert(authTokens).values({
    id: await sha256Hex(token),
    employeeId,
    purpose,
    expiresAt: new Date(Date.now() + TOKEN_TTL[purpose]).toISOString(),
  });
  return `${await appUrl()}/set-password?token=${encodeURIComponent(token)}`;
}

/** Always answers the same way, so it can't be used to discover who works here. */
export async function requestPasswordReset(_: unknown, fd: FormData) {
  return run(async () => {
    const email = emailSchema.parse(formObject(fd).email);
    const emp = await findByEmail(email);
    if (emp && emp.status !== "exited") {
      const link = await issueToken(emp.id, "reset");
      await sendEmail({
        to: emp.email,
        toEmployeeId: emp.id,
        subject: "Reset your HR+ password",
        text: compose({
          name: emp.name,
          lines: [
            "Someone asked to reset your HR+ password. The link below works once, for the next hour.",
            "If it wasn't you, ignore this email; your password stays the same.",
          ],
          link,
          linkLabel: "Choose a new password",
        }),
      });
    }
    return { message: "If that email belongs to someone here, a reset link is on its way. It works for an hour." };
  });
}

/** HR sends a sign-in invite. Returns the link too, so it can be shared another way. */
export async function sendInvite(employeeId: string) {
  return run<{ link: string; emailed: boolean }>(async () => {
    const user = await requireUser();
    assert(isPeopleTeam(user), "Only the People team can send sign-in invites.");
    const db = await getDb();
    const emp = await db.query.employees.findFirst({ where: eq(employees.id, employeeId) });
    if (!emp || emp.status === "exited") throw new UserError("This person can't be invited.");
    const link = await issueToken(emp.id, "invite");
    const status = await sendEmail({
      to: emp.email,
      toEmployeeId: emp.id,
      subject: "Your HR+ account is ready",
      text: compose({
        name: emp.name,
        lines: [
          `${user.name} invited you to HR+, where you'll clock in, apply for time off, file expenses and see your payslips.`,
          `Choose a password to finish setting up. You'll sign in with ${emp.email}. The link works for 7 days.`,
        ],
        link,
        linkLabel: "Set your password",
      }),
    });
    await audit(user.id, "auth.invite", "employee", emp.id, { emailed: status === "sent" });
    return {
      message: status === "sent" ? `Invite emailed to ${emp.email}.` : "Invite link created. Copy it and send it to them.",
      data: { link, emailed: status === "sent" },
    };
  });
}

const newPasswordSchema = z.object({ password: z.string().max(200), confirm: z.string().max(200) }).superRefine((v, ctx) => {
  const problem = passwordProblem(v.password);
  if (problem) ctx.addIssue({ code: "custom", message: problem, path: ["password"] });
  else if (v.password !== v.confirm) ctx.addIssue({ code: "custom", message: "The two passwords don't match.", path: ["confirm"] });
});

async function savePassword(employeeId: string, password: string) {
  const db = await getDb();
  const passwordHash = await hashPassword(password);
  await db
    .insert(credentials)
    .values({ employeeId, passwordHash, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({ target: credentials.employeeId, set: { passwordHash, updatedAt: new Date().toISOString() } });
}

/** Finishes an invite or a reset: sets the password, signs out other devices, signs in here. */
export async function setPasswordWithToken(_: unknown, fd: FormData) {
  const result = await run(async () => {
    const o = formObject(fd);
    const token = z.string().min(20, "This link is incomplete.").max(200).parse(o.token);
    const v = newPasswordSchema.parse(o);
    const db = await getDb();
    const row = await db.query.authTokens.findFirst({ where: eq(authTokens.id, await sha256Hex(token)) });
    if (!row || row.usedAt || row.expiresAt < new Date().toISOString())
      throw new UserError("This link has expired or was already used. Ask for a new one from the sign-in page.");
    const emp = await db.query.employees.findFirst({ where: eq(employees.id, row.employeeId) });
    if (!emp || emp.status === "exited") throw new UserError("This account is closed.");
    await savePassword(emp.id, v.password);
    await db.update(authTokens).set({ usedAt: new Date().toISOString() }).where(eq(authTokens.id, row.id));
    await db.delete(sessions).where(eq(sessions.employeeId, emp.id));
    await createSession(emp.id);
    await audit(emp.id, row.purpose === "invite" ? "auth.accept_invite" : "auth.reset_password", "employee", emp.id);
  });
  if (result.ok) redirect("/home?welcome=1");
  return result;
}

export async function changePassword(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    const o = formObject(fd);
    const current = z
      .string()
      .max(200)
      .parse(o.current ?? "");
    const v = newPasswordSchema.parse(o);
    const db = await getDb();
    const cred = await db.query.credentials.findFirst({ where: eq(credentials.employeeId, user.id) });
    if (cred && !(await verifyPassword(current, cred.passwordHash))) throw new UserError("Your current password isn't right.");
    await savePassword(user.id, v.password);
    await audit(user.id, "auth.change_password", "employee", user.id);
    return { message: cred ? "Password changed." : "Password set. You can now sign in with your email." };
  });
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
