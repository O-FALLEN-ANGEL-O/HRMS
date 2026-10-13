import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth";
import { Chat } from "./chat";

export const metadata = { title: "HR assistant" };

export default async function AssistantPage() {
  const user = await requireUser();
  const db = await getDb();
  const policies = await db.select({ title: schema.policies.title }).from(schema.policies);
  return <Chat firstName={user.name.split(" ")[0]!} policies={policies.map((p) => p.title)} />;
}
