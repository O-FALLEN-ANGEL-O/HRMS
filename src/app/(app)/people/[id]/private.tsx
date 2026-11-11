"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, Copy, KeyRound, Mail, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { changePassword, sendInvite } from "@/app/actions/auth";
import { deleteDocument, updatePrivateDetails, uploadDocument, verifyDocument } from "@/app/actions/profile";
import { FileInput } from "@/components/file-input";
import { FormDialog } from "@/components/form-dialog";
import { Button, Field, SubmitButton } from "@/components/ui";
import { PasswordField } from "@/app/sign-in-form";
import { DOC_LABEL } from "@/lib/documents";

export type PrivateDetails = {
  personalEmail: string | null;
  address: string | null;
  emergencyName: string | null;
  emergencyRelation: string | null;
  emergencyPhone: string | null;
  bloodGroup: string | null;
  pan: string | null;
  aadhaarLast4: string | null;
  uan: string | null;
  esiNumber: string | null;
  bankName: string | null;
  bankAccount: string | null;
  ifsc: string | null;
};

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function EditPrivateDetails({ employeeId, details, self }: { employeeId: string; details: PrivateDetails | null; self: boolean }) {
  const d = details;
  return (
    <FormDialog
      side="right"
      title={self ? "Your personal details" : "Personal details"}
      description="Only you and the People team can see these. Payroll uses the bank, PAN and UAN details."
      action={updatePrivateDetails}
      trigger={
        <Button variant="ghost" size="sm">
          <Pencil aria-hidden /> {d ? "Edit" : "Add details"}
        </Button>
      }
    >
      {({ fieldErrors }) => {
        const e = (k: string) =>
          fieldErrors?.[k] ? (
            <p className="text-rose mt-1 text-xs" role="alert">
              {fieldErrors[k]}
            </p>
          ) : null;
        const input = (name: keyof PrivateDetails | "aadhaar", label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, hint?: string) => (
          <Field label={label} htmlFor={`pd-${name}`} hint={hint}>
            <input
              id={`pd-${name}`}
              name={name}
              className="field"
              defaultValue={name === "aadhaar" ? "" : (d?.[name] ?? "")}
              aria-invalid={!!fieldErrors?.[name]}
              {...props}
            />
            {e(name)}
          </Field>
        );
        return (
          <>
            <input type="hidden" name="employeeId" value={employeeId} />
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Contact</legend>
              {input("personalEmail", "Personal email", { type: "email", autoComplete: "email" })}
              <Field label="Home address" htmlFor="pd-address">
                <textarea id="pd-address" name="address" className="field min-h-16" defaultValue={d?.address ?? ""} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                {input("emergencyName", "Emergency contact")}
                {input("emergencyRelation", "Relationship")}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {input("emergencyPhone", "Their phone", { type: "tel", inputMode: "tel" })}
                <Field label="Blood group" htmlFor="pd-bloodGroup">
                  <select id="pd-bloodGroup" name="bloodGroup" className="field" defaultValue={d?.bloodGroup ?? ""}>
                    <option value="">Not given</option>
                    {BLOOD.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </fieldset>
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Tax and statutory</legend>
              <div className="grid grid-cols-2 gap-3">
                {input("pan", "PAN", { autoCapitalize: "characters", placeholder: "ABCDE1234F", maxLength: 10 })}
                {input(
                  "aadhaar",
                  "Aadhaar",
                  { inputMode: "numeric", placeholder: d?.aadhaarLast4 ? `On file: •••• ${d.aadhaarLast4}` : "12 digits" },
                  "Only the last 4 digits are kept.",
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {input("uan", "UAN (PF)", { inputMode: "numeric", maxLength: 14 })}
                {input("esiNumber", "ESI number", { inputMode: "numeric" }, "Only if your gross is under ₹21,000.")}
              </div>
            </fieldset>
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Salary account</legend>
              {input("bankName", "Bank")}
              <div className="grid grid-cols-2 gap-3">
                {input("bankAccount", "Account number", { inputMode: "numeric", autoComplete: "off" })}
                {input("ifsc", "IFSC", { autoCapitalize: "characters", placeholder: "HDFC0001234", maxLength: 11 })}
              </div>
            </fieldset>
            <div className="flex justify-end">
              <SubmitButton pendingLabel="Saving">Save details</SubmitButton>
            </div>
          </>
        );
      }}
    </FormDialog>
  );
}

export function UploadDocument({ employeeId }: { employeeId: string }) {
  return (
    <FormDialog
      title="Upload a document"
      description="A clear photo or a PDF, up to 1 MB. Big photos are shrunk for you."
      action={uploadDocument}
      trigger={
        <Button variant="ghost" size="sm">
          <Upload aria-hidden /> Upload
        </Button>
      }
    >
      {() => (
        <>
          <input type="hidden" name="employeeId" value={employeeId} />
          <Field label="What is it?" htmlFor="doc-kind">
            <select id="doc-kind" name="kind" className="field" required defaultValue="">
              <option value="" disabled>
                Choose…
              </option>
              {Object.entries(DOC_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="File" htmlFor="doc-file">
            <FileInput id="doc-file" name="file" required />
          </Field>
          <div className="flex justify-end">
            <SubmitButton pendingLabel="Uploading">Upload</SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}

export function DocumentActions({ id, canVerify, canDelete }: { id: string; canVerify: boolean; canDelete: boolean }) {
  const [pending, start] = useTransition();
  const act = (fn: (id: string) => Promise<{ ok: boolean; message?: string; error?: string }>, confirmText?: string) => () => {
    if (confirmText && !confirm(confirmText)) return;
    start(async () => {
      const r = await fn(id);
      if (r.ok) toast.success(r.message ?? "Done.");
      else toast.error(r.error ?? "That didn't work.");
    });
  };
  return (
    <span className="flex shrink-0 items-center gap-1">
      {canVerify ? (
        <Button variant="ghost" size="sm" disabled={pending} onClick={act(verifyDocument)}>
          <BadgeCheck aria-hidden /> Verify
        </Button>
      ) : null}
      {canDelete ? (
        <Button variant="ghost" size="sm" disabled={pending} onClick={act(deleteDocument, "Remove this document?")} aria-label="Remove document">
          <Trash2 aria-hidden />
        </Button>
      ) : null}
    </span>
  );
}

/** People team: send (or re-send) a sign-in invite, and copy the link. */
export function InviteButton({ employeeId, hasPassword }: { employeeId: string; hasPassword: boolean }) {
  const [pending, start] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await sendInvite(employeeId);
            if (r.ok) {
              toast.success(r.message ?? "Invite ready.");
              setLink(r.data?.link ?? null);
            } else toast.error(r.error);
          })
        }
      >
        <Mail aria-hidden /> {pending ? "Creating link…" : hasPassword ? "Send a new sign-in link" : "Send sign-in invite"}
      </Button>
      {link ? (
        <div className="bg-surface-2 flex items-center gap-2 rounded-lg p-2">
          <code className="min-w-0 flex-1 truncate text-xs">{link}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("Link copied. It works once, for 7 days."))}
            aria-label="Copy invite link"
          >
            <Copy aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ChangePassword({ hasPassword }: { hasPassword: boolean }) {
  return (
    <FormDialog
      title={hasPassword ? "Change your password" : "Set a password"}
      description="At least 10 characters. Other devices stay signed in."
      action={changePassword}
      trigger={
        <Button variant="outline" size="sm">
          <KeyRound aria-hidden /> {hasPassword ? "Change password" : "Set a password"}
        </Button>
      }
    >
      {({ fieldErrors }) => (
        <>
          {hasPassword ? <PasswordField id="pw-current" name="current" label="Current password" autoComplete="current-password" /> : null}
          <PasswordField id="pw-new" name="password" label="New password" autoComplete="new-password" error={fieldErrors?.password} />
          <PasswordField id="pw-confirm" name="confirm" label="Type it again" autoComplete="new-password" error={fieldErrors?.confirm} />
          <div className="flex justify-end">
            <SubmitButton pendingLabel="Saving">Save password</SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}
