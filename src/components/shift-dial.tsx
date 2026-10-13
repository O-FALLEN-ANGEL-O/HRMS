"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * The shift dial: a 24-hour ring of one workday. The grey arc is core hours,
 * the ink arc is time worked, the marigold tick is now.
 */
export function ShiftDial({
  size = 260,
  checkIn,
  checkOut,
  label,
  sublabel,
  animateIn = true,
}: {
  size?: number;
  checkIn?: string | null; // ISO
  checkOut?: string | null; // ISO
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  animateIn?: boolean;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const stroke = size * 0.075;
  const r = size / 2 - stroke;
  const c = size / 2;
  const circ = 2 * Math.PI * r;

  // Hours in IST as a fraction of the day.
  const istHours = (d: Date) => ((d.getUTCHours() + d.getUTCMinutes() / 60 + 5.5) % 24) / 24;
  const nowF = now ? istHours(now) : null;
  const inF = checkIn ? istHours(new Date(checkIn)) : null;
  const outF = checkOut ? istHours(new Date(checkOut)) : nowF;
  const workedF = inF !== null && outF !== null ? Math.max(0, outF - inF) : 0;

  const core = { start: 11 / 24, len: 5 / 24 };

  const arc = (start: number, len: number) => ({
    strokeDasharray: `${len * circ} ${circ}`,
    strokeDashoffset: -start * circ,
  });

  const tick = (f: number, inner: number, outer: number) => {
    const a = f * 2 * Math.PI - Math.PI / 2;
    return { x1: c + inner * Math.cos(a), y1: c + inner * Math.sin(a), x2: c + outer * Math.cos(a), y2: c + outer * Math.sin(a) };
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--line-strong)" strokeWidth={stroke} strokeLinecap="butt" style={arc(core.start, core.len)} opacity={0.7} />
        {inF !== null ? (
          <motion.circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={stroke}
            strokeLinecap="round"
            initial={animateIn ? { strokeDasharray: `0 ${circ}`, strokeDashoffset: -inF * circ } : false}
            animate={arc(inF, workedF)}
            transition={{ duration: 1.2, ease: [0.3, 0.7, 0.1, 1], delay: 0.2 }}
          />
        ) : null}
      </svg>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" aria-hidden>
        {[0, 6, 12, 18].map((h) => {
          const t = tick(h / 24, r - stroke * 1.3, r - stroke * 0.9);
          return <line key={h} {...t} stroke="var(--ink-3)" strokeWidth={1.5} strokeLinecap="round" />;
        })}
        {nowF !== null ? (
          <motion.g initial={animateIn ? { opacity: 0, scale: 0.6 } : false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1, type: "spring", stiffness: 260, damping: 18 }} style={{ originX: `${c}px`, originY: `${c}px` }}>
            <line {...tick(nowF, r - stroke * 0.95, r + stroke * 0.95)} stroke="var(--marigold)" strokeWidth={stroke * 0.42} strokeLinecap="round" />
          </motion.g>
        ) : null}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          {label ? <div className="font-display text-[1.9rem] leading-none font-semibold tabular" style={{ fontSize: size * 0.13 }}>{label}</div> : null}
          {sublabel ? <div className="mt-1.5 text-sm text-ink-2">{sublabel}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function useIstClock() {
  const [t, setT] = useState<string>("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return t;
}
