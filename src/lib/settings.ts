import "server-only";
import { cache } from "react";
import { z } from "zod";
import { getDb, schema } from "@/db/client";

/**
 * Company rules the People team can change in Settings. Each rule has a default
 * (what the app did before these were configurable), so an empty table behaves
 * exactly as before.
 */
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM, e.g. 09:30.");

export const RulesSchema = z
  .object({
    coreStart: hhmm,
    coreEnd: hhmm,
    leaveBackdateDays: z.coerce.number().int().min(0).max(365),
    claimWindowDays: z.coerce.number().int().min(1).max(365),
    internetMonthlyLimit: z.coerce.number().int().min(0).max(1_00_000),
    receiptRequiredAbove: z.coerce.number().int().min(0).max(10_00_000),
    emailNotifications: z.boolean(),
  })
  .refine((r) => r.coreStart < r.coreEnd, { message: "Core hours must end after they start.", path: ["coreEnd"] });

export type Rules = z.infer<typeof RulesSchema>;

export const DEFAULT_RULES: Rules = {
  coreStart: "11:00",
  coreEnd: "16:00",
  leaveBackdateDays: 30,
  claimWindowDays: 30,
  internetMonthlyLimit: 1000,
  receiptRequiredAbove: 500,
  emailNotifications: true,
};

const KEY = "rules";

/** Current rules, merged over the defaults. Cached per request. */
export const getRules = cache(async (): Promise<Rules> => {
  const db = await getDb();
  const row = await db.query.appSettings.findFirst({ where: (s, { eq }) => eq(s.key, KEY) });
  if (!row) return DEFAULT_RULES;
  try {
    const parsed = RulesSchema.safeParse({ ...DEFAULT_RULES, ...JSON.parse(row.value) });
    return parsed.success ? parsed.data : DEFAULT_RULES;
  } catch {
    return DEFAULT_RULES;
  }
});

export async function saveRules(rules: Rules, actorId: string) {
  const db = await getDb();
  const value = JSON.stringify(rules);
  await db
    .insert(schema.appSettings)
    .values({ key: KEY, value, updatedBy: actorId, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({ target: schema.appSettings.key, set: { value, updatedBy: actorId, updatedAt: new Date().toISOString() } });
}

/** "11:00" → minutes after midnight. */
export const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
