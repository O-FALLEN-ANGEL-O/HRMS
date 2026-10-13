"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { DndContext, PointerSensor, KeyboardSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { UserPlus, Sparkles, Loader2, Mail, Pause, Play, Lock } from "lucide-react";
import { addCandidate, moveCandidate, scoreCandidate, setJobStatus } from "@/app/actions/recruitment";
import { FormDialog } from "@/components/form-dialog";
import { Avatar, Button, Dialog, DialogContent, Field, Pill, SubmitButton } from "@/components/ui";
import { cn, timeAgo } from "@/lib/utils";

const STAGES = ["applied", "screening", "interview", "offer", "hired", "rejected"] as const;
type Stage = (typeof STAGES)[number];
const LABEL: Record<Stage, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Not moving on",
};

type Cand = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  stage: Stage;
  score: number | null;
  summary: string | null;
  resume: string;
  createdAt: string;
};
type Match = { summary: string; strengths: string[]; gaps: string[]; questions: string[]; source: "ai" | "rules" };

function ScoreRing({ score, size = 34 }: { score: number | null; size?: number }) {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  const tone = score === null ? "var(--line-strong)" : score >= 80 ? "var(--teal)" : score >= 60 ? "var(--marigold)" : "var(--rose)";
  return (
    <span
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      aria-label={score === null ? "Not scored" : `${score}% match`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={3.5} />
        {score !== null ? (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={tone}
            strokeWidth={3.5}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${c}` }}
            animate={{ strokeDasharray: `${(score / 100) * c} ${c}` }}
            transition={{ duration: 0.8 }}
          />
        ) : null}
      </svg>
      <span className="tabular absolute text-[0.7rem] font-semibold">{score ?? "–"}</span>
    </span>
  );
}

function Card({ c, onOpen }: { c: Cand; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: c.id, data: { stage: c.stage } });
  const m: Match | null = c.summary ? JSON.parse(c.summary) : null;
  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(1.5deg)` } : undefined}
      className={cn(
        "border-line bg-surface touch-none rounded-[10px] border p-3 shadow-[0_1px_0_rgb(24_32_58/0.04)] transition-shadow",
        isDragging && "z-10 shadow-[var(--shadow)]",
      )}
      {...attributes}
      {...listeners}
      aria-roledescription="Draggable candidate"
      aria-label={`${c.name}, ${c.score ?? "not scored"}. Press space to pick up, arrow keys to move, space to drop.`}
    >
      <div className="flex items-start gap-2.5">
        <ScoreRing score={c.score} />
        <div className="min-w-0 flex-1">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={onOpen}
            className="block w-full truncate text-left text-sm font-medium hover:underline"
          >
            {c.name}
          </button>
          <p className="text-ink-3 truncate text-xs">
            {c.source}, {timeAgo(c.createdAt)}
          </p>
        </div>
      </div>
      {m?.summary ? <p className="text-ink-2 mt-2 line-clamp-2 text-xs">{m.summary}</p> : null}
    </div>
  );
}

function Column({ stage, items, onOpen }: { stage: Stage; items: Cand[]; onOpen: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <section
      ref={setNodeRef}
      aria-label={LABEL[stage]}
      className={cn(
        "bg-surface-2/70 flex w-64 shrink-0 flex-col rounded-[12px] border border-transparent p-2 transition-colors",
        isOver && "border-ink/30 bg-surface-2",
      )}
    >
      <header className="flex items-center justify-between px-1.5 py-1.5">
        <h2 className={cn("text-sm font-semibold", stage === "rejected" && "text-ink-3")}>{LABEL[stage]}</h2>
        <span className="text-ink-3 tabular text-xs">{items.length}</span>
      </header>
      <div className="flex min-h-24 flex-1 flex-col gap-2">
        {items.map((c) => (
          <Card key={c.id} c={c} onOpen={() => onOpen(c.id)} />
        ))}
      </div>
    </section>
  );
}

function CandidateSheet({ c, onClose, onMove }: { c: Cand | null; onClose: () => void; onMove: (id: string, s: Stage) => void }) {
  const [pending, start] = useTransition();
  const m: Match | null = c?.summary ? JSON.parse(c.summary) : null;
  return (
    <Dialog open={!!c} onOpenChange={(o) => !o && onClose()}>
      {c ? (
        <DialogContent side="right" title={c.name} description={`${c.email}${c.phone ? `, ${c.phone}` : ""}`}>
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="stage" className="text-ink-2 text-sm">
                Stage
              </label>
              <select id="stage" className="field w-auto" value={c.stage} onChange={(e) => onMove(c.id, e.target.value as Stage)}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {LABEL[s]}
                  </option>
                ))}
              </select>
              <Button variant="ghost" size="sm" asChild>
                <a href={`mailto:${c.email}`}>
                  <Mail aria-hidden /> Email
                </a>
              </Button>
            </div>

            <section className="border-line rounded-[12px] border p-4">
              <div className="flex items-center gap-3">
                <ScoreRing score={c.score} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold">Resume match</p>
                  <p className="text-ink-2 text-sm">{m?.summary ?? "Not scored yet."}</p>
                </div>
                {m ? <Pill t={m.source === "ai" ? "info" : "neutral"}>{m.source === "ai" ? "AI" : "Keywords"}</Pill> : null}
              </div>
              {m ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-teal mb-1 text-sm font-medium">Matches</p>
                    <ul className="list-disc space-y-1 pl-4 text-sm">
                      {m.strengths.length ? m.strengths.map((s, i) => <li key={i}>{s}</li>) : <li className="text-ink-3">Nothing clear</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="text-rose mb-1 text-sm font-medium">Check in interview</p>
                    <ul className="list-disc space-y-1 pl-4 text-sm">
                      {m.gaps.length ? m.gaps.map((s, i) => <li key={i}>{s}</li>) : <li className="text-ink-3">No obvious gaps</li>}
                    </ul>
                  </div>
                </div>
              ) : null}
              {m?.questions.length ? (
                <div className="mt-4">
                  <p className="mb-1 text-sm font-medium">Questions to ask</p>
                  <ol className="text-ink-2 list-decimal space-y-1 pl-4 text-sm">
                    {m.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ol>
                </div>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const r = await scoreCandidate(c.id);
                    r.ok ? toast.success(r.message) : toast.error(r.error);
                  })
                }
              >
                {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Sparkles aria-hidden />} {c.score === null ? "Score resume" : "Score again"}
              </Button>
            </section>

            <section>
              <h3 className="font-display mb-2 font-semibold">Resume</h3>
              <p className="text-ink-2 text-sm whitespace-pre-line">{c.resume}</p>
            </section>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

export function Pipeline({ jobId, candidates }: { jobId: string; candidates: Cand[] }) {
  const [state, move] = useOptimistic(candidates, (s, { id, stage }: { id: string; stage: Stage }) => s.map((c) => (c.id === id ? { ...c, stage } : c)));
  const [openId, setOpenId] = useState<string | null>(null);
  const [, start] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
  const grouped = useMemo(() => Object.fromEntries(STAGES.map((s) => [s, state.filter((c) => c.stage === s)])) as Record<Stage, Cand[]>, [state]);

  const doMove = (id: string, stage: Stage) =>
    start(async () => {
      move({ id, stage });
      const r = await moveCandidate(id, stage);
      if (r.ok) {
        if (r.message) toast.success(r.message);
      } else toast.error(r.error);
    });

  const onDragEnd = (e: DragEndEvent) => {
    const to = e.over?.id as Stage | undefined;
    if (to && to !== e.active.data.current?.stage) doMove(String(e.active.id), to);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-ink-2 text-sm">Drag cards between stages, or open a candidate to see their match and move them.</p>
        <AddCandidate jobId={jobId} />
      </div>
      <DndContext id={`pipeline-${jobId}`} sensors={sensors} onDragEnd={onDragEnd}>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {STAGES.map((s) => (
            <Column key={s} stage={s} items={grouped[s]} onOpen={setOpenId} />
          ))}
        </div>
      </DndContext>
      <CandidateSheet c={state.find((c) => c.id === openId) ?? null} onClose={() => setOpenId(null)} onMove={doMove} />
    </>
  );
}

function AddCandidate({ jobId }: { jobId: string }) {
  return (
    <FormDialog
      side="right"
      title="Add a candidate"
      description="Paste their resume text; it's scored against this role's requirements when you save."
      action={addCandidate}
      trigger={
        <Button variant="accent">
          <UserPlus aria-hidden /> Add candidate
        </Button>
      }
    >
      {() => (
        <>
          <input type="hidden" name="jobId" value={jobId} />
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" className="field" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" htmlFor="email">
              <input id="email" name="email" type="email" className="field" required />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <input id="phone" name="phone" type="tel" className="field" />
            </Field>
          </div>
          <Field label="Source" htmlFor="source">
            <select id="source" name="source" className="field" defaultValue="LinkedIn">
              {["LinkedIn", "Referral", "Careers page", "Naukri", "Agency", "Other"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Resume text" htmlFor="resumeText">
            <textarea
              id="resumeText"
              name="resumeText"
              className="field min-h-56 font-mono text-xs"
              required
              minLength={40}
              placeholder="Paste the resume here"
            />
          </Field>
          <div className="flex justify-end">
            <SubmitButton variant="accent" pendingLabel="Scoring">
              Add and score
            </SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}

export function JobControls({ jobId, status }: { jobId: string; status: "open" | "paused" | "closed" }) {
  const [pending, start] = useTransition();
  const set = (s: "open" | "paused" | "closed") =>
    start(async () => {
      const r = await setJobStatus(jobId, s);
      r.ok ? toast.success(r.message) : toast.error(r.error);
    });
  return (
    <div className="flex gap-2">
      {status !== "open" ? (
        <Button variant="outline" size="sm" onClick={() => set("open")} disabled={pending}>
          <Play aria-hidden /> Reopen
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => set("paused")} disabled={pending}>
          <Pause aria-hidden /> Pause
        </Button>
      )}
      {status !== "closed" ? (
        <Button variant="ghost" size="sm" onClick={() => set("closed")} disabled={pending}>
          <Lock aria-hidden /> Close role
        </Button>
      ) : null}
    </div>
  );
}
