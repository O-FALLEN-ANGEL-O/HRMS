"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db/client";
import { DOCUMENT_KINDS } from "@/db/schema";
import { assert, isPeopleTeam, requireUser } from "@/lib/auth";
import { formObject, run, UserError } from "@/lib/action";
import { storeUpload } from "@/lib/files";
import { audit, notify } from "@/lib/queries";
import { newId } from "@/lib/utils";

const { employeePrivate, employeeDocuments, files, employees } = schema;

/** Personal details belong to the person and the People team; managers don't see them. */
async function requireSelfOrHr(employeeId: string) {
  const user = await requireUser();
  assert(user.id === employeeId || isPeopleTeam(user), "Only this person and the People team can see these details.");
  return user;
}

const opt = <T extends z.ZodType>(s: T) => z.union([z.literal("").transform(() => null), s]).optional();
const upper = (re: RegExp, msg: string) =>
  z
    .string()
    .transform((v) => v.replace(/\s+/g, "").toUpperCase())
    .pipe(z.string().regex(re, msg));
const digits = (re: RegExp, msg: string) =>
  z
    .string()
    .transform((v) => v.replace(/[\s-]+/g, ""))
    .pipe(z.string().regex(re, msg));

const detailsSchema = z.object({
  employeeId: z.string(),
  personalEmail: opt(z.string().email("Enter a valid email.").max(200)),
  address: opt(z.string().max(300)),
  emergencyName: opt(z.string().max(80)),
  emergencyRelation: opt(z.string().max(40)),
  emergencyPhone: opt(z.string().regex(/^[+\d][\d\s-]{6,18}$/, "Enter a phone number.")),
  bloodGroup: opt(z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])),
  pan: opt(upper(/^[A-Z]{5}\d{4}[A-Z]$/, "A PAN looks like ABCDE1234F.")),
  // Accept the full number or the last 4, but keep only the last 4.
  aadhaar: opt(digits(/^(\d{4}|\d{12})$/, "Enter the 12-digit Aadhaar number or its last 4 digits.").transform((v) => v.slice(-4))),
  uan: opt(digits(/^\d{12}$/, "A UAN has 12 digits.")),
  esiNumber: opt(digits(/^(\d{10}|\d{17})$/, "An ESI number has 10 or 17 digits.")),
  bankName: opt(z.string().max(80)),
  bankAccount: opt(digits(/^\d{9,18}$/, "Account numbers have 9 to 18 digits.")),
  ifsc: opt(upper(/^[A-Z]{4}0[A-Z0-9]{6}$/, "An IFSC looks like HDFC0001234.")),
});

export async function updatePrivateDetails(_: unknown, fd: FormData) {
  return run(async () => {
    const o = formObject(fd);
    const user = await requireSelfOrHr(String(o.employeeId ?? ""));
    const v = detailsSchema.parse(o);
    if ((v.bankAccount || v.ifsc) && !(v.bankAccount && v.ifsc)) throw new UserError("Add both the account number and the IFSC.");
    const db = await getDb();
    const before = await db.query.employeePrivate.findFirst({ where: eq(employeePrivate.employeeId, v.employeeId) });
    const row = {
      personalEmail: v.personalEmail ?? null,
      address: v.address ?? null,
      emergencyName: v.emergencyName ?? null,
      emergencyRelation: v.emergencyRelation ?? null,
      emergencyPhone: v.emergencyPhone ?? null,
      bloodGroup: v.bloodGroup ?? null,
      pan: v.pan ?? null,
      // A blank Aadhaar field keeps what's on file, since only the last 4 are ever shown back.
      aadhaarLast4: v.aadhaar ?? before?.aadhaarLast4 ?? null,
      uan: v.uan ?? null,
      esiNumber: v.esiNumber ?? null,
      bankName: v.bankName ?? null,
      bankAccount: v.bankAccount ?? null,
      ifsc: v.ifsc ?? null,
      updatedAt: new Date().toISOString(),
    };
    await db
      .insert(employeePrivate)
      .values({ employeeId: v.employeeId, ...row })
      .onConflictDoUpdate({ target: employeePrivate.employeeId, set: row });
    // Record which fields changed, never their values.
    const changed = (Object.keys(row) as (keyof typeof row)[]).filter((k) => k !== "updatedAt" && (before?.[k] ?? null) !== row[k]);
    await audit(user.id, "profile.private_update", "employee", v.employeeId, { fields: changed });
    // Bank and tax changes made by the person themselves are flagged to the People team.
    const sensitive = changed.filter((k) => ["bankAccount", "ifsc", "pan"].includes(k));
    if (sensitive.length && user.id === v.employeeId) {
      const hr = await db
        .select({ id: employees.id })
        .from(employees)
        .where(and(inArray(employees.role, ["admin", "hr"]), eq(employees.status, "active")));
      for (const h of hr)
        if (h.id !== user.id) await notify(h.id, `${user.name} changed their ${sensitive.includes("pan") ? "PAN" : "bank details"}`, `/people/${user.id}`);
    }
    revalidatePath(`/people/${v.employeeId}`);
    return { message: changed.length ? "Details saved." : "Nothing changed." };
  });
}

export async function uploadDocument(_: unknown, fd: FormData) {
  return run(async () => {
    const o = formObject(fd);
    const user = await requireSelfOrHr(String(o.employeeId ?? ""));
    const v = z.object({ employeeId: z.string(), kind: z.enum(DOCUMENT_KINDS, { message: "Choose what this document is." }) }).parse(o);
    const fileId = await storeUpload(fd.get("file"), { employeeId: v.employeeId, purpose: "document", uploadedBy: user.id });
    const db = await getDb();
    const id = newId("doc");
    // Uploaded by the People team counts as verified.
    const verified = isPeopleTeam(user) && user.id !== v.employeeId;
    await db.insert(employeeDocuments).values({
      id,
      employeeId: v.employeeId,
      kind: v.kind,
      fileId,
      verifiedAt: verified ? new Date().toISOString() : null,
      verifiedBy: verified ? user.id : null,
    });
    await audit(user.id, "document.upload", "employee", v.employeeId, { kind: v.kind });
    revalidatePath(`/people/${v.employeeId}`);
    return { message: verified ? "Document added." : "Document uploaded. HR will verify it." };
  });
}

export async function verifyDocument(id: string) {
  return run(async () => {
    const user = await requireUser();
    assert(isPeopleTeam(user), "Only the People team can verify documents.");
    const db = await getDb();
    const doc = await db.query.employeeDocuments.findFirst({ where: eq(employeeDocuments.id, id) });
    if (!doc) throw new UserError("That document is gone.");
    assert(doc.employeeId !== user.id, "Someone else on the People team needs to verify your own documents.");
    await db.update(employeeDocuments).set({ verifiedAt: new Date().toISOString(), verifiedBy: user.id }).where(eq(employeeDocuments.id, id));
    await audit(user.id, "document.verify", "employee", doc.employeeId, { kind: doc.kind });
    revalidatePath(`/people/${doc.employeeId}`);
    return { message: "Marked as verified." };
  });
}

export async function deleteDocument(id: string) {
  return run(async () => {
    const user = await requireUser();
    const db = await getDb();
    const doc = await db.query.employeeDocuments.findFirst({ where: eq(employeeDocuments.id, id) });
    if (!doc) throw new UserError("That document is already gone.");
    // People can remove their own unverified uploads; verified ones need the People team.
    assert(isPeopleTeam(user) || (doc.employeeId === user.id && !doc.verifiedAt), "Verified documents can only be removed by the People team.");
    await db.delete(employeeDocuments).where(eq(employeeDocuments.id, doc.id));
    await db.delete(files).where(eq(files.id, doc.fileId));
    await audit(user.id, "document.delete", "employee", doc.employeeId, { kind: doc.kind });
    revalidatePath(`/people/${doc.employeeId}`);
    return { message: "Document removed." };
  });
}
