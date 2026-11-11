"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, getEnv, schema } from "@/db/client";
import { resetDemoData } from "@/db/reset";
import { assert, isPeopleTeam, requireUser } from "@/lib/auth";
import { formObject, run } from "@/lib/action";
import { audit } from "@/lib/queries";
import { RulesSchema, getRules, saveRules } from "@/lib/settings";

export async function resetDemo() {
  const user = await requireUser();
  assert(user.role === "admin", "Only admins can reset the demo.");
  const env = await getEnv();
  await resetDemoData(env.DB);
  revalidatePath("/", "layout");
  // Sessions were wiped with everything else.
  redirect("/?reset=1");
}

export async function updatePolicy(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    assert(isPeopleTeam(user), "Only the People team can edit policies.");
    const v = z
      .object({ id: z.string(), title: z.string().min(3).max(80), body: z.string().min(40, "Policies need a bit more detail.").max(4000) })
      .parse(formObject(fd));
    const db = await getDb();
    await db.update(schema.policies).set({ title: v.title, body: v.body }).where(eq(schema.policies.id, v.id));
    await audit(user.id, "policy.update", "policy", v.id);
    revalidatePath("/settings");
    return { message: "Policy saved. The HR assistant uses the new text from now on." };
  });
}

export async function updateRules(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    assert(isPeopleTeam(user), "Only the People team can change company rules.");
    const o = formObject(fd);
    const rules = RulesSchema.parse({ ...o, emailNotifications: o.emailNotifications === "on" });
    const before = await getRules();
    await saveRules(rules, user.id);
    const changed = Object.fromEntries(Object.entries(rules).filter(([k, v]) => before[k as keyof typeof before] !== v));
    await audit(user.id, "settings.rules", "settings", "rules", changed);
    revalidatePath("/", "layout");
    return { message: Object.keys(changed).length ? "Rules saved. They apply from now on." : "Nothing changed." };
  });
}
