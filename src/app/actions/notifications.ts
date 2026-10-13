"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth";

export async function markAllRead() {
  const user = await requireUser();
  const db = await getDb();
  await db
    .update(schema.notifications)
    .set({ readAt: new Date().toISOString() })
    .where(and(eq(schema.notifications.employeeId, user.id), isNull(schema.notifications.readAt)));
  revalidatePath("/", "layout");
}
