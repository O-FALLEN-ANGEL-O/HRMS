"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { ChevronDown, LogIn } from "lucide-react";
import { signInAs } from "./actions/auth";
import { ShiftDial, useIstClock } from "@/components/shift-dial";
import { Avatar, Button, SubmitButton } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export type Persona = { code: string; role: string; name: string; title: string; does: string; hue: number };

const ROLE_LABEL: Record<string, string> = { admin: "Admin", hr: "HR", manager: "Manager", employee: "Employee", recruiter: "Recruiter" };

const ease = [0.2, 0.7, 0.2, 1] as const;

function PersonCard({ p, i }: { p: Persona; i: number }) {
  return (
    <motion.form
      action={signInAs}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 + i * 0.09, duration: 0.45, ease }}
      className="group relative"
    >
      <input type="hidden" name="code" value={p.code} />
      <button
        type="submit"
        className="panel flex w-full items-start gap-3 p-4 text-left transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[var(--shadow)] focus-visible:outline-offset-4"
        aria-label={`Sign in as ${p.name}, ${ROLE_LABEL[p.role]}`}
      >
        <Avatar name={p.name} hue={p.hue} size={42} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="font-display text-[1.05rem] font-semibold">{p.name}</span>
            <span className="text-xs font-medium text-ink-3">{ROLE_LABEL[p.role]}</span>
          </span>
          <span className="block text-sm text-ink-2">{p.title}</span>
          <span className="mt-2 block text-sm leading-snug text-ink-2">{p.does}</span>
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink group-hover:text-marigold-ink">
            <LogIn className="size-4" aria-hidden /> Sign in as {p.name.split(" ")[0]}
          </span>
        </span>
      </button>
    </motion.form>
  );
}

function Connector({ className }: { className?: string }) {
  return <div aria-hidden className={cn("mx-auto h-5 w-px bg-line-strong", className)} />;
}

export function Landing({
  personas,
  everyone,
  people,
  present,
  dbOk,
  error,
  continueAs,
  footer,
}: {
  personas: Persona[];
  everyone: { code: string; name: string; title: string; role: string; hue: number }[];
  people: number;
  present: number;
  dbOk: boolean;
  error?: string;
  continueAs: { name: string; href: string } | null;
  footer: React.ReactNode;
}) {
  const clock = useIstClock();
  const [showAll, setShowAll] = useState(false);
  const by = (code: string) => personas.find((p) => p.code === code)!;

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          {continueAs ? (
            <Button asChild variant="outline" size="sm">
              <a href={continueAs.href}>Continue as {continueAs.name.split(" ")[0]}</a>
            </Button>
          ) : null}
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <section className="grid items-center gap-10 pt-6 pb-14 md:grid-cols-[1.1fr_0.9fr] md:pt-12">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="max-w-[16ch] text-[2.6rem] leading-[1.02] font-[680] sm:text-5xl md:text-[3.9rem]">
              Everything your people team does, on one workday.
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.6 }} className="mt-5 max-w-[52ch] text-lg text-ink-2">
              HR+ handles attendance, time off, expenses, Indian payroll, hiring, onboarding, goals and the helpdesk — with an AI assistant that answers from your own policies. Pick a person below to try it from their side.
            </motion.p>
            {error ? <p className="mt-4 rounded-lg bg-rose-soft px-3 py-2 text-sm text-rose">That person couldn&apos;t be signed in. Pick someone from the list.</p> : null}
            {!dbOk ? <p className="mt-4 rounded-lg bg-marigold-soft px-3 py-2 text-sm text-marigold-ink">The database isn&apos;t reachable right now, so sign-in won&apos;t work until it&apos;s back.</p> : null}
          </div>

          <div className="flex flex-col items-center gap-4">
            <ShiftDial
              size={300}
              checkIn={null}
              label={clock || " "}
              sublabel={dbOk ? `${present} of ${people} people clocked in` : "India Standard Time"}
            />
            <p className="max-w-[34ch] text-center text-sm text-ink-3">The ring is today in IST. Grey is core hours, the marigold mark is now.</p>
          </div>
        </section>

        <section aria-labelledby="who" className="border-t border-line pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="who" className="text-2xl">
                Whose day do you want to see?
              </h2>
              <p className="mt-1 text-ink-2">Each person sees what their role allows. Approvals flow up the reporting line shown here.</p>
            </div>
          </div>

          {/* Reporting tree: Meera → Arjun → Sana, Meera → Kavya → Rohan */}
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto max-w-sm">
              <PersonCard p={by("E001")} i={0} />
            </div>
            <div aria-hidden className="relative mx-auto hidden h-6 max-w-[calc(50%+2px)] border-x border-t border-line-strong md:block" style={{ marginTop: 20 }} />
            <Connector className="md:hidden" />
            <div className="grid gap-x-8 md:grid-cols-2">
              <div>
                <PersonCard p={by("E002")} i={1} />
                <Connector />
                <PersonCard p={by("E005")} i={3} />
              </div>
              <div className="mt-5 md:mt-0">
                <PersonCard p={by("E003")} i={2} />
                <Connector />
                <PersonCard p={by("E004")} i={4} />
              </div>
            </div>
          </div>

          {everyone.length ? (
            <div className="mx-auto mt-10 max-w-4xl">
              <button onClick={() => setShowAll((s) => !s)} aria-expanded={showAll} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
                <ChevronDown className={cn("size-4 transition-transform", showAll && "rotate-180")} aria-hidden />
                Or sign in as anyone else at Northwind Labs ({everyone.length})
              </button>
              {showAll ? (
                <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 grid gap-1 overflow-hidden sm:grid-cols-2">
                  {everyone.map((e) => (
                    <li key={e.code}>
                      <form action={signInAs} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface">
                        <input type="hidden" name="code" value={e.code} />
                        <Avatar name={e.name} hue={e.hue} size={30} />
                        <span className="min-w-0 flex-1 text-sm leading-tight">
                          <span className="block truncate font-medium">{e.name}</span>
                          <span className="block truncate text-xs text-ink-3">{e.title}</span>
                        </span>
                        <SubmitButton size="sm" variant="ghost" pendingLabel="Signing in">
                          Sign in
                        </SubmitButton>
                      </form>
                    </li>
                  ))}
                </motion.ul>
              ) : null}
            </div>
          ) : null}
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-6 text-sm text-ink-3 sm:px-8">{footer}</div>
      </footer>
    </div>
  );
}
