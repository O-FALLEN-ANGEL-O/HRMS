import "server-only";
import { headers } from "next/headers";
import { getDb, getEnv, schema } from "@/db/client";
import { newId } from "./utils";

/**
 * Email. Every message is written to `email_outbox` first (Settings shows it),
 * then handed to Resend when RESEND_API_KEY and EMAIL_FROM are set.
 * In demo mode nothing leaves the app: the demo's addresses are fictional.
 */
async function setting(name: string): Promise<string | undefined> {
  const env = (await getEnv()) as unknown as Record<string, unknown>;
  const v = env[name] ?? process.env[name];
  return typeof v === "string" && v ? v : undefined;
}

export async function isDemoMode() {
  return (await setting("DEMO_MODE")) !== "false";
}

export type EmailStatus = "sent" | "skipped" | "failed";

export async function emailProvider(): Promise<{ ready: boolean; from?: string; reason?: string }> {
  if (await isDemoMode()) return { ready: false, reason: "Demo mode: emails are recorded here, not sent." };
  const key = await setting("RESEND_API_KEY");
  const from = await setting("EMAIL_FROM");
  if (!key || !from) return { ready: false, reason: "No email provider set up: add RESEND_API_KEY and EMAIL_FROM." };
  return { ready: true, from };
}

/** The app's public address, for links in emails. */
export async function appUrl() {
  const fixed = await setting("APP_URL");
  if (fixed) return fixed.replace(/\/$/, "");
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) return `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
  } catch {
    // Not in a request (e.g. a cron job).
  }
  return "";
}

export async function sendEmail(msg: { to: string; toEmployeeId?: string | null; subject: string; text: string }): Promise<EmailStatus> {
  const provider = await emailProvider();
  let status: EmailStatus = "skipped";
  let detail = provider.reason ?? null;
  if (provider.ready) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${await setting("RESEND_API_KEY")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: provider.from, to: [msg.to], subject: msg.subject, text: msg.text }),
        signal: AbortSignal.timeout(10_000),
      });
      const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      status = res.ok ? "sent" : "failed";
      detail = res.ok ? (json.id ?? null) : `Resend ${res.status}: ${json.message ?? res.statusText}`;
    } catch (err) {
      status = "failed";
      detail = err instanceof Error ? err.message : "Network error";
    }
  }
  const db = await getDb();
  await db.insert(schema.emailOutbox).values({
    id: newId("em"),
    toEmployeeId: msg.toEmployeeId ?? null,
    toEmail: msg.to,
    subject: msg.subject.slice(0, 200),
    body: msg.text.slice(0, 8000),
    status,
    detail,
  });
  return status;
}

/** A plain-text email in the app's voice, with a link back. */
export function compose(opts: { name: string; lines: string[]; link?: string; linkLabel?: string; notification?: boolean }) {
  const first = opts.name.split(" ")[0];
  return [
    `Hi ${first},`,
    "",
    ...opts.lines,
    ...(opts.link ? ["", `${opts.linkLabel ?? "Open HR+"}: ${opts.link}`] : []),
    "",
    "— HR+",
    ...(opts.notification ? ["You get these because your company turned on email notifications in HR+."] : []),
  ].join("\n");
}
