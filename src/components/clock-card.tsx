"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Building2, House, MapPin, LogOut as LogOutIcon, Loader2 } from "lucide-react";
import { clockIn, clockOut } from "@/app/actions/workday";
import { ShiftDial, useIstClock } from "./shift-dial";
import { Button, Segmented } from "./ui";
import { formatTime } from "@/lib/utils";

type Mode = "office" | "remote" | "field";

function duration(fromIso: string, toIso?: string | null) {
  const ms = (toIso ? Date.parse(toIso) : Date.now()) - Date.parse(fromIso);
  const m = Math.max(0, Math.round(ms / 60000));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}

export function ClockCard({
  today,
  isWorkday,
  onLeave,
  holiday,
}: {
  today: { checkIn: string | null; checkOut: string | null; mode: Mode } | null;
  isWorkday: boolean;
  onLeave?: string | null;
  holiday?: string | null;
}) {
  const clock = useIstClock();
  const [mode, setMode] = useState<Mode>(today?.mode ?? "office");
  const [pending, start] = useTransition();
  const [useLocation, setUseLocation] = useState(false);

  const status = !today?.checkIn ? "out" : today.checkOut ? "done" : "in";

  const doClockIn = () =>
    start(async () => {
      let coords: { lat?: number; lng?: number } = {};
      if (useLocation && "geolocation" in navigator) {
        coords = await new Promise((resolve) =>
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => {
              toast.message("Location wasn't shared, so you're clocked in without it.");
              resolve({});
            },
            { timeout: 6000 },
          ),
        );
      }
      const r = await clockIn({ mode, ...coords });
      r.ok ? toast.success(r.message) : toast.error(r.error);
    });

  const doClockOut = () =>
    start(async () => {
      const r = await clockOut();
      r.ok ? toast.success(r.message) : toast.error(r.error);
    });

  const sub =
    status === "in"
      ? `Working ${duration(today!.checkIn!)}`
      : status === "done"
        ? `Worked ${duration(today!.checkIn!, today!.checkOut)}`
        : holiday
          ? holiday
          : onLeave
            ? onLeave
            : isWorkday
              ? "Not clocked in"
              : "Weekend";

  return (
    <div className="@container w-full">
      <div className="flex flex-col items-center justify-center gap-6 @min-[560px]:flex-row @min-[560px]:items-center">
        <ShiftDial size={220} checkIn={today?.checkIn} checkOut={today?.checkOut} label={clock || " "} sublabel={sub} />
        <div className="w-full max-w-xs space-y-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={status} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
              {status === "out" ? (
                <div className="space-y-3">
                  <Segmented
                    label="Where are you working?"
                    value={mode}
                    onChange={setMode}
                    options={[
                      { value: "office", label: "Office" },
                      { value: "remote", label: "Remote" },
                      { value: "field", label: "Field" },
                    ]}
                  />
                  <label className="text-ink-2 flex items-center gap-2 text-sm">
                    <input type="checkbox" className="size-4 accent-[var(--ink)]" checked={useLocation} onChange={(e) => setUseLocation(e.target.checked)} />
                    <MapPin className="text-ink-3 size-4" aria-hidden /> Attach my approximate location
                  </label>
                  <Button variant="accent" size="lg" className="w-full" onClick={doClockIn} disabled={pending}>
                    {pending ? <Loader2 className="animate-spin" aria-hidden /> : mode === "office" ? <Building2 aria-hidden /> : <House aria-hidden />}
                    Clock in
                  </Button>
                </div>
              ) : status === "in" ? (
                <div className="space-y-3">
                  <p className="text-ink-2 text-sm">
                    In since <span className="text-ink font-medium">{formatTime(today!.checkIn)}</span>,{" "}
                    {today!.mode === "office" ? "at the office" : today!.mode === "remote" ? "working remotely" : "in the field"}.
                  </p>
                  <Button variant="primary" size="lg" className="w-full" onClick={doClockOut} disabled={pending}>
                    {pending ? <Loader2 className="animate-spin" aria-hidden /> : <LogOutIcon aria-hidden />}
                    Clock out
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-ink-2 text-sm">
                    {formatTime(today!.checkIn)} to {formatTime(today!.checkOut)}. Done for the day.
                  </p>
                  <Button variant="outline" className="w-full" onClick={doClockIn} disabled={pending}>
                    Resume working
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
