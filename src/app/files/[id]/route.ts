import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getCurrentUser } from "@/lib/auth";
import { canViewFile, fromBase64 } from "@/lib/files";

/** Serves an uploaded file to people allowed to see it (see canViewFile). */
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in to view this file.", { status: 401 });
  const { id } = await ctx.params;
  const db = await getDb();
  const file = await db.query.files.findFirst({ where: eq(schema.files.id, id) });
  if (!file || !(await canViewFile(user, file))) return new Response("Not found.", { status: 404 });
  return new Response(fromBase64(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${file.name.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
    },
  });
}
