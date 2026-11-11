import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { UserError } from "./action";
import { isPeopleTeam, type CurrentUser } from "./auth";
import { newId } from "./utils";

/** D1 keeps each value under 2 MB; base64 adds a third, so files stay at or under 1 MB. */
export const MAX_FILE_BYTES = 1_000_000;
export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "JPEG image",
  "image/png": "PNG image",
  "image/webp": "WebP image",
  "application/pdf": "PDF",
};

function toBase64(bytes: Uint8Array) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function fromBase64(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Checks the file's real type from its first bytes, so a renamed file can't pass as a PDF or image. */
export function sniff(bytes: Uint8Array): string | null {
  const b = (i: number) => bytes[i] ?? -1;
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return "image/jpeg";
  if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47) return "image/png";
  if (b(0) === 0x25 && b(1) === 0x50 && b(2) === 0x44 && b(3) === 0x46) return "application/pdf";
  if (b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46 && b(8) === 0x57 && b(9) === 0x45 && b(10) === 0x42 && b(11) === 0x50)
    return "image/webp";
  return null;
}

/** Validates and stores an uploaded file; returns its id. */
export async function storeUpload(file: unknown, opts: { employeeId: string; purpose: "document" | "receipt"; uploadedBy: string }): Promise<string> {
  if (!(file instanceof File) || file.size === 0) throw new UserError("Choose a file to upload.");
  if (file.size > MAX_FILE_BYTES) throw new UserError("Files can be up to 1 MB. Photos are shrunk automatically; for a PDF, save a smaller copy.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniff(bytes);
  if (!mime || !ALLOWED_TYPES[mime]) throw new UserError("Upload a JPEG, PNG, WebP image or a PDF.");
  const id = newId("file");
  const name = (file.name || "upload").replace(/[^\w.\- ()]+/g, "_").slice(0, 120);
  const db = await getDb();
  await db.insert(schema.files).values({
    id,
    employeeId: opts.employeeId,
    purpose: opts.purpose,
    name,
    mime,
    size: bytes.length,
    data: toBase64(bytes),
    uploadedBy: opts.uploadedBy,
  });
  return id;
}

/**
 * Who may open a file: its owner and the People team; for receipts, also the
 * owner's manager (who approves the claim).
 */
export async function canViewFile(user: CurrentUser, file: { employeeId: string; purpose: string }) {
  if (file.employeeId === user.id || isPeopleTeam(user)) return true;
  if (file.purpose !== "receipt") return false;
  const db = await getDb();
  const owner = await db.query.employees.findFirst({ where: eq(schema.employees.id, file.employeeId), columns: { managerId: true } });
  return owner?.managerId === user.id;
}
