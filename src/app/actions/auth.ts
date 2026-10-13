"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { DEMO_LOGINS } from "@/db/seed";
import { createSession, destroySession } from "@/lib/auth";

export async function signInAs(formData: FormData) {
  const role = String(formData.get("role") ?? "");
  const code = String(formData.get("code") ?? "") || DEMO_LOGINS[role as keyof typeof DEMO_LOGINS];
  if (!code) redirect("/?error=unknown");
  const db = await getDb();
  const emp = await db.query.employees.findFirst({ where: eq(schema.employees.code, code) });
  if (!emp || emp.status === "exited") redirect("/?error=unknown");
  await createSession(emp.id);
  redirect("/home");
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
