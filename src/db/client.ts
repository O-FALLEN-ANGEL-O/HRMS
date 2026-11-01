import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { ensureDatabase } from "./setup";
import { isNodeRuntime, nodeEnv } from "./node-runtime";

/** Worker bindings on Cloudflare; REST/SQLite stand-ins on Vercel and other Node hosts. */
export async function getEnv(): Promise<CloudflareEnv> {
  if (isNodeRuntime()) return nodeEnv();
  const { env } = await getCloudflareContext({ async: true });
  return env as CloudflareEnv;
}

export async function getDb() {
  const env = await getEnv();
  await ensureDatabase(env.DB);
  return drizzle(env.DB, { schema });
}

export type Db = Awaited<ReturnType<typeof getDb>>;
export { schema };
