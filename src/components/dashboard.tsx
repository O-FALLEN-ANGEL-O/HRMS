"use client";

import * as React from "react";
import Link from "next/link";
import { animate, motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.2, 0.7, 0.2, 1] as const;

export type Tone = "ink" | "teal" | "marigold" | "rose" | "sky";
const TONE_VAR: Record<Tone, string> = {
  ink: "var(--ink)",
  teal: "var(--teal)",
  marigold: "var(--marigold)",
  rose: "var(--rose)",
  sky: "var(--sky)",
};

/* ---------------- Layout ---------------- */

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
};
const tileVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease } },
};

/** 12-column bento grid; children are `Tile`s that animate in one after another. */
export function Bento({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={gridVariants} initial="hidden" animate="show" className={cn("grid grid-cols-12 gap-4 lg:gap-5", className)}>
      {children}
    </motion.div>
  );
}

/**
 * A bento tile with a soft spotlight that follows the pointer.
 * Pass `title` for a header row; `href` turns the header action into a link.
 */
export function Tile({
  children,
  className,
  bodyClassName,
  title,
  action,
  icon,
  glow = "var(--marigold)",
  as = "section",
}: {
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  title?: React.ReactNode;
  action?: { label: string; href: string } | React.ReactNode;
  icon?: React.ReactNode;
  glow?: string;
  as?: "section" | "div";
}) {
  const ref = React.useRef<HTMLElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const Comp = as === "div" ? motion.div : motion.section;
  const isLink = action && typeof action === "object" && "href" in (action as object);
  return (
    <Comp
      ref={ref as never}
      variants={tileVariants}
      onPointerMove={onMove}
      style={{ "--glow": glow } as React.CSSProperties}
      className={cn("panel tile-spotlight group/tile relative flex min-w-0 flex-col overflow-hidden", className)}
    >
      {title ? (
        <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-1">
          <h2 className="font-display flex items-center gap-2 text-[1.02rem] font-semibold">
            {icon ? <span className="text-ink-3 [&_svg]:size-4">{icon}</span> : null}
            {title}
          </h2>
          {isLink ? (
            <Link
              href={(action as { href: string }).href}
              className="text-ink-2 hover:text-ink inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm transition-colors"
            >
              {(action as { label: string }).label}
              <ArrowUpRight className="size-3.5 transition-transform group-hover/tile:translate-x-0.5 group-hover/tile:-translate-y-0.5" aria-hidden />
            </Link>
          ) : action ? (
            <div className="flex shrink-0 items-center gap-2">{action as React.ReactNode}</div>
          ) : null}
        </header>
      ) : null}
      <div className={cn("relative flex-1 p-5", title && "pt-3", bodyClassName)}>{children}</div>
    </Comp>
  );
}

/* ---------------- Numbers ---------------- */

/**
 * Counts every number inside `value` up from zero, keeping the surrounding text
 * ("12/30", "₹54,210", "+42") intact. The server HTML always carries the real
 * value; only numbers on screen when the page opens animate, so nothing below
 * the fold ever shows a stale zero.
 */
export function CountUp({ value, className, duration = 1.1 }: { value: React.ReactNode; className?: string; duration?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const text = typeof value === "number" || typeof value === "string" ? String(value) : null;
  const [shown, setShown] = React.useState(text);

  React.useLayoutEffect(() => {
    setShown(text);
    if (text === null || reduce || !/\d/.test(text) || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const parts = text.split(/(\d[\d,]*(?:\.\d+)?)/);
    const targets = parts.map((p) => (/^\d/.test(p) ? { n: Number(p.replace(/,/g, "")), commas: p.includes(","), dec: (p.split(".")[1] ?? "").length } : null));
    const fmt = (t: NonNullable<(typeof targets)[number]>, v: number) =>
      t.commas ? v.toLocaleString("en-IN", { maximumFractionDigits: t.dec, minimumFractionDigits: t.dec }) : v.toFixed(t.dec);
    const frame = (k: number) =>
      parts.map((p, i) => (targets[i] ? fmt(targets[i]!, targets[i]!.dec ? targets[i]!.n * k : Math.round(targets[i]!.n * k)) : p)).join("");
    setShown(frame(0));
    const controls = animate(0, 1, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (k) => setShown(frame(k)) });
    return () => controls.stop();
  }, [text, reduce, duration]);

  if (text === null) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={cn("tabular", className)} aria-label={text}>
      <span aria-hidden>{shown}</span>
    </span>
  );
}

/* ---------------- Charts ---------------- */

/** Small area sparkline that draws itself in. */
export function Sparkline({ data, tone = "teal", className, label }: { data: number[]; tone?: Tone; className?: string; label?: string }) {
  const id = React.useId().replace(/:/g, "");
  if (data.length < 2) return null;
  const w = 120;
  const h = 36;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 3 - ((v - min) / span) * (h - 8)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const last = pts.at(-1)!;
  const color = TONE_VAR[tone];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-9 w-full overflow-visible", className)} role="img" aria-label={label ?? "Trend"} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={area} fill={`url(#sg${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      />
      <motion.circle cx={last[0]} cy={last[1]} r={2.6} fill={color} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }} />
      <circle cx={last[0]} cy={last[1]} r={2.6} fill={color} className="spark-ping" style={{ transformOrigin: `${last[0]}px ${last[1]}px` }} />
    </svg>
  );
}

/** Radial progress ring with the value in the middle. */
export function Ring({
  value,
  size = 76,
  stroke = 7,
  tone = "teal",
  children,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  children?: React.ReactNode;
  label: string;
}) {
  const pct = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${Math.round(pct * 100)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={TONE_VAR[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pct }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export type DayBar = { date: string; label: string; value: number; secondary?: number; note?: string; muted?: boolean; today?: boolean };

/**
 * Vertical bars that grow in, one per day. `secondary` stacks on top in a second
 * colour (e.g. people on leave). Each bar has a hover/focus readout.
 */
export function DayBars({
  data,
  max,
  unit,
  primaryLabel,
  secondaryLabel,
  tone = "teal",
}: {
  data: DayBar[];
  max: number;
  unit: string;
  primaryLabel: string;
  secondaryLabel?: string;
  tone?: Tone;
}) {
  const [active, setActive] = React.useState<number | null>(null);
  const top = Math.max(max, 1);
  const shown = active ?? data.findIndex((d) => d.today);
  const cur = data[shown >= 0 ? shown : data.length - 1];
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex min-h-[3.25rem] items-end justify-between gap-3">
        <div aria-live="polite">
          <p className="text-ink-3 text-xs">{cur ? (cur.note ?? cur.label) : ""}</p>
          <p className="font-display tabular text-2xl font-semibold">
            {cur ? (Number.isInteger(cur.value) ? cur.value : cur.value.toFixed(1)) : 0}
            <span className="text-ink-3 ml-1 text-sm font-normal">{unit}</span>
            {cur?.secondary ? (
              <span className="text-ink-2 ml-2 text-sm font-normal">
                + {cur.secondary} {secondaryLabel}
              </span>
            ) : null}
          </p>
        </div>
        <div className="text-ink-3 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px]" style={{ background: TONE_VAR[tone] }} aria-hidden />
            {primaryLabel}
          </span>
          {secondaryLabel ? (
            <span className="flex items-center gap-1.5">
              <span className="bg-marigold size-2.5 rounded-[3px]" aria-hidden />
              {secondaryLabel}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex min-h-40 flex-1 items-end gap-1.5 sm:gap-2" role="list" aria-label={`${primaryLabel} by day`}>
        {data.map((d, i) => {
          const hp = (d.value / top) * 100;
          const hs = ((d.secondary ?? 0) / top) * 100;
          return (
            <button
              key={d.date}
              type="button"
              role="listitem"
              aria-label={`${d.note ?? d.label}: ${d.value} ${unit}${d.secondary ? `, ${d.secondary} ${secondaryLabel}` : ""}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="group/bar flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5 rounded-md focus-visible:outline-offset-2"
            >
              <span className="relative flex w-full flex-1 flex-col justify-end overflow-hidden rounded-[6px]">
                <span className="bg-surface-2 absolute inset-0 rounded-[6px] opacity-60" aria-hidden />
                <motion.span
                  className="bg-marigold relative w-full rounded-t-[4px]"
                  initial={{ height: 0 }}
                  animate={{ height: `${hs}%` }}
                  transition={{ duration: 0.7, ease, delay: 0.35 + i * 0.035 }}
                />
                <motion.span
                  className={cn("relative w-full", !d.secondary && "rounded-t-[4px]", d.muted && "opacity-35")}
                  style={{ background: TONE_VAR[tone], opacity: active === null || active === i ? undefined : 0.45 }}
                  initial={{ height: 0 }}
                  animate={{ height: `${hp}%` }}
                  transition={{ duration: 0.7, ease, delay: 0.2 + i * 0.035 }}
                />
              </span>
              <span className={cn("tabular text-[0.7rem] leading-none", d.today ? "text-ink font-semibold" : "text-ink-3")}>{d.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Hero ---------------- */

/** Ticking IST clock. Renders a placeholder until mounted to avoid hydration drift. */
export function LiveClock() {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (o: Intl.DateTimeFormatOptions) => (now ? new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...o }).format(now) : "");
  const hm = fmt({ hour: "numeric", minute: "2-digit", hour12: true });
  const s = fmt({ second: "2-digit" }).padStart(2, "0");
  return (
    <p className="font-display tabular flex items-baseline gap-1 text-3xl font-semibold sm:text-4xl" suppressHydrationWarning>
      <span>{now ? hm.replace(/\s?(am|pm)/i, "") : "--:--"}</span>
      <span className="text-marigold-ink w-[2ch] text-lg sm:text-xl">{now ? s : "--"}</span>
      <span className="text-ink-2 text-base font-medium uppercase sm:text-lg">{now ? hm.match(/am|pm/i)?.[0] : ""}</span>
      <span className="text-ink-3 ml-1 text-xs font-normal">IST</span>
    </p>
  );
}

export function HeroChip({ href, children, tone = "ink" }: { href: string; children: React.ReactNode; tone?: Tone }) {
  return (
    <Link
      href={href}
      className={cn(
        "bg-surface/70 border-line hover:border-line-strong inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm backdrop-blur transition-[border-color,transform] hover:-translate-y-px [&_svg]:size-3.5",
        tone === "marigold" && "border-marigold/40 bg-marigold-soft text-marigold-ink",
        tone === "rose" && "border-rose/30 bg-rose-soft text-rose",
      )}
    >
      {children}
    </Link>
  );
}

export function QuickAction({ href, icon, label, hint }: { href: string; icon: React.ReactNode; label: string; hint: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 420, damping: 26 }}>
      <Link
        href={href}
        className="bg-surface border-line hover:border-line-strong group/qa flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-[border-color,box-shadow] hover:shadow-[var(--shadow)]"
      >
        <span className="bg-surface-2 text-ink group-hover/qa:bg-marigold grid size-9 shrink-0 place-items-center rounded-lg transition-colors group-hover/qa:text-[#1d1300] [&_svg]:size-[18px]">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium">{label}</span>
          <span className="text-ink-3 block truncate text-xs">{hint}</span>
        </span>
      </Link>
    </motion.div>
  );
}

/** Stat tile body: label, animated number, optional sparkline or ring. */
export function KpiTile({
  label,
  value,
  sub,
  href,
  series,
  ring,
  tone = "teal",
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  href: string;
  series?: number[];
  ring?: number;
  tone?: Tone;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Tile className={className} glow={TONE_VAR[tone]} as="div" bodyClassName="p-0">
      <Link href={href} className="flex h-full flex-col justify-between gap-3 p-4 focus-visible:outline-offset-[-2px]">
        <span className="flex items-start justify-between gap-2">
          <span className="text-ink-2 text-sm">{label}</span>
          {icon ? (
            <span
              className="text-ink-3 grid size-7 place-items-center rounded-full transition-colors group-hover/tile:text-[var(--glow)] [&_svg]:size-4"
              aria-hidden
            >
              {icon}
            </span>
          ) : null}
        </span>
        <span className="flex items-end justify-between gap-3">
          <span className="min-w-0">
            <CountUp value={value} className="font-display block text-3xl leading-none font-semibold" />
            {sub ? <span className="text-ink-3 mt-1.5 line-clamp-2 block text-xs sm:truncate">{sub}</span> : null}
          </span>
          {ring !== undefined ? (
            <Ring value={ring} size={46} stroke={5} tone={tone} label={label} />
          ) : series && series.length > 1 ? (
            <span className="w-14 shrink-0 sm:w-28">
              <Sparkline data={series} tone={tone} label={`${label}, last ${series.length} working days`} />
            </span>
          ) : null}
        </span>
      </Link>
    </Tile>
  );
}
