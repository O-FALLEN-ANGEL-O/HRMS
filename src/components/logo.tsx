import Link from "next/link";

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 rounded-md" aria-label="HR+ home">
      <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden>
        <rect width="64" height="64" rx="16" fill="var(--ink)" />
        <circle cx="32" cy="32" r="19" fill="none" stroke="color-mix(in oklab, var(--paper) 25%, var(--ink))" strokeWidth="6" />
        <path d="M32 13a19 19 0 0 1 18.07 13.13" fill="none" stroke="var(--marigold)" strokeWidth="6" strokeLinecap="round" />
        <path d="M32 24v16M24 32h16" stroke="var(--paper)" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
      {compact ? null : <span className="font-display text-xl font-bold tracking-tight">HR+</span>}
    </Link>
  );
}
