import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const formatINR = (n: number) => inr.format(Math.round(n));

const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
export const formatCompact = (n: number) => compact.format(n);

/* ---- Dates. The company runs on IST; all date strings are YYYY-MM-DD. ---- */

const IST_OFFSET_MS = 330 * 60 * 1000;

export function nowIST(): Date {
  return new Date(Date.now() + IST_OFFSET_MS);
}

export function todayIST(): string {
  return nowIST().toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export function isWeekend(date: string): boolean {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

/** Working days in [start, end], skipping weekends and the given holidays. */
export function workingDays(start: string, end: string, holidays: string[] = []): number {
  let count = 0;
  for (let d = start; d <= end; d = addDays(d, 1)) {
    if (!isWeekend(d) && !holidays.includes(d)) count++;
  }
  return count;
}

export function formatDate(date: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  if (!date) return "—";
  const d = date.length === 10 ? new Date(`${date}T00:00:00Z`) : new Date(date);
  return new Intl.DateTimeFormat("en-IN", { timeZone: date.length === 10 ? "UTC" : "Asia/Kolkata", ...opts }).format(d);
}

export function formatTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return formatDate(iso);
}

export function monthLabel(month: string) {
  return formatDate(`${month}-01`, { month: "long", year: "numeric" });
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function plural(n: number, word: string, pluralWord = `${word}s`) {
  return `${n} ${n === 1 ? word : pluralWord}`;
}
