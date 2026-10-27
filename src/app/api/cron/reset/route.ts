import { getEnv } from "@/db/client";
import { resetDemoData } from "@/db/reset";

/**
 * Nightly demo reset for Vercel (scheduled in vercel.json). On Cloudflare the
 * Worker's own cron does this. Vercel sends CRON_SECRET as a bearer token.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  const env = await getEnv();
  if (env.DEMO_MODE !== "true") return Response.json({ skipped: "DEMO_MODE is not true" });
  const statements = await resetDemoData(env.DB);
  return Response.json({ reset: true, statements });
}
