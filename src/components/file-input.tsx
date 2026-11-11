"use client";

import * as React from "react";
import { FileText, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_BYTES = 1_000_000;
const MAX_SIDE = 1800;

/** Re-encodes a large photo as JPEG at most 1800 px on its longest side, so phone pictures fit the 1 MB limit. */
async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= MAX_BYTES) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const q of [0.82, 0.7, 0.55]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", q));
    if (blob && blob.size <= MAX_BYTES) return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  }
  return file;
}

const kb = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1000))} KB`);

/**
 * A file field for forms posted to server actions. Shows the chosen file,
 * shrinks big photos, and warns when a file is still over 1 MB.
 */
export function FileInput({
  id,
  name,
  required,
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  label = "Choose a photo or PDF",
}: {
  id: string;
  name: string;
  required?: boolean;
  accept?: string;
  label?: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [picked, setPicked] = React.useState<{ name: string; size: number; type: string } | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return setPicked(null);
    setBusy(true);
    const out = await shrink(f);
    if (out !== f) {
      const dt = new DataTransfer();
      dt.items.add(out);
      e.target.files = dt.files;
    }
    setPicked({ name: out.name, size: out.size, type: out.type });
    setBusy(false);
  }

  function clear() {
    if (ref.current) ref.current.value = "";
    setPicked(null);
  }

  const tooBig = picked && picked.size > MAX_BYTES;
  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "border-line hover:border-line-strong bg-surface flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-sm transition-colors",
          tooBig && "border-rose",
        )}
      >
        <span className="bg-surface-2 text-ink-2 grid size-8 shrink-0 place-items-center rounded-md [&_svg]:size-4" aria-hidden>
          {picked?.type === "application/pdf" ? <FileText /> : <ImageIcon />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{busy ? "Preparing…" : picked ? picked.name : label}</span>
          <span className="text-ink-3 block text-xs">{picked ? kb(picked.size) : "JPEG, PNG, WebP or PDF, up to 1 MB"}</span>
        </span>
        {picked ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              clear();
            }}
            className="text-ink-3 hover:text-ink rounded p-1"
            aria-label="Remove file"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </label>
      <input ref={ref} id={id} name={name} type="file" accept={accept} required={required} onChange={onChange} className="sr-only" />
      {tooBig ? (
        <p className="text-rose mt-1 text-xs" role="alert">
          This file is over 1 MB. Save a smaller copy and try again.
        </p>
      ) : null}
    </div>
  );
}
