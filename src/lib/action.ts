import "server-only";
import { z } from "zod";
import { ForbiddenError } from "./auth";

export type ActionResult<T = undefined> = { ok: true; message?: string; data?: T } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export class UserError extends Error {}

/** Runs a server action body and turns expected failures into a result object. */
export async function run<T>(fn: () => Promise<{ message?: string; data?: T } | void>): Promise<ActionResult<T>> {
  try {
    const r = (await fn()) ?? {};
    return { ok: true, ...r };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of err.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
      return { ok: false, error: Object.values(fieldErrors)[0] ?? "Check the highlighted fields.", fieldErrors };
    }
    if (err instanceof UserError || err instanceof ForbiddenError) return { ok: false, error: err.message };
    // Let Next.js redirects and notFound propagate.
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      String((err as { digest: string }).digest).startsWith("NEXT_")
    )
      throw err;
    console.error("action failed", err);
    return { ok: false, error: "Something went wrong saving that. Try again in a moment." };
  }
}

export const formObject = (fd: FormData) => Object.fromEntries([...fd.entries()].map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));

export const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.");
export const timeStr = z.string().regex(/^\d{2}:\d{2}$/, "Enter a time like 09:30.");
