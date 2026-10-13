"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { answerSurvey, closeSurvey, createSurvey } from "@/app/actions/support";
import { FormDialog } from "@/components/form-dialog";
import { Button, Field, Pill, SubmitButton } from "@/components/ui";
import { cn } from "@/lib/utils";

type Survey = { id: string; title: string; question: string; kind: "enps" | "pulse"; status: "open" | "closed" };

export function SurveyCard({
  survey,
  scores,
  comments,
  myScore,
  headcount,
  canManage,
}: {
  survey: Survey;
  scores: number[];
  comments: string[];
  myScore: number | null;
  headcount: number;
  canManage: boolean;
}) {
  const [pick, setPick] = useState<number | null>(myScore);
  const [comment, setComment] = useState("");
  const [pending, start] = useTransition();
  const range = survey.kind === "enps" ? Array.from({ length: 11 }, (_, i) => i) : [1, 2, 3, 4, 5];
  const n = scores.length;
  const promoters = scores.filter((s) => s >= 9).length;
  const detractors = scores.filter((s) => s <= 6).length;
  const enps = n ? Math.round(((promoters - detractors) / n) * 100) : 0;
  const avg = n ? scores.reduce((a, b) => a + b, 0) / n : 0;
  const dist = range.map((v) => scores.filter((s) => s === v).length);
  const peak = Math.max(1, ...dist);
  const answered = myScore !== null;

  const submit = () =>
    pick !== null &&
    start(async () => {
      const r = await answerSurvey(survey.id, pick, comment);
      r.ok ? toast.success(r.message) : toast.error(r.error);
    });

  return (
    <article className="panel p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl">{survey.title}</h2>
          <p className="text-ink-2 mt-1">{survey.question}</p>
        </div>
        <Pill t={survey.status === "open" ? "good" : "neutral"}>{survey.status === "open" ? "Open" : "Closed"}</Pill>
      </header>

      {survey.status === "open" ? (
        <div className="mt-5">
          <div role="radiogroup" aria-label={survey.question} className={cn("grid gap-1.5", survey.kind === "enps" ? "grid-cols-11" : "grid-cols-5")}>
            {range.map((v) => (
              <button
                key={v}
                role="radio"
                aria-checked={pick === v}
                onClick={() => setPick(v)}
                className={cn(
                  "tabular h-10 rounded-[8px] border text-sm font-medium transition-colors",
                  pick === v ? "border-ink bg-ink text-paper" : "border-line bg-surface hover:border-line-strong",
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="text-ink-3 mt-1 flex justify-between text-xs">
            <span>{survey.kind === "enps" ? "Not likely" : "Overwhelming"}</span>
            <span>{survey.kind === "enps" ? "Very likely" : "Very manageable"}</span>
          </div>
          <label htmlFor={`c-${survey.id}`} className="sr-only">
            Anything to add?
          </label>
          <textarea
            id={`c-${survey.id}`}
            className="field mt-3 min-h-16"
            placeholder="Anything to add? (optional, anonymous)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-ink-3 text-xs">{answered ? "You've answered. You can change it until it closes." : `${n} of ${headcount} have answered`}</p>
            <Button onClick={submit} disabled={pick === null || pending} size="sm">
              {answered ? "Update answer" : "Submit"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="border-line mt-6 border-t pt-4">
        <div className="flex items-baseline justify-between">
          <p className="text-ink-2 text-sm">{n} responses</p>
          <p className="font-display tabular text-2xl font-semibold">
            {survey.kind === "enps" ? (n ? `${enps > 0 ? "+" : ""}${enps}` : "—") : n ? `${avg.toFixed(1)} / 5` : "—"}
          </p>
        </div>
        <div className="mt-3 flex h-20 items-end gap-1" aria-hidden>
          {dist.map((d, i) => (
            <motion.div
              key={i}
              className={cn(
                "flex-1 rounded-t-[4px]",
                survey.kind === "enps" ? (range[i]! >= 9 ? "bg-teal" : range[i]! <= 6 ? "bg-rose/70" : "bg-line-strong") : "bg-ink/80",
              )}
              initial={{ height: 0 }}
              animate={{ height: `${(d / peak) * 100}%` }}
              transition={{ delay: i * 0.03, type: "spring", stiffness: 140, damping: 18 }}
            />
          ))}
        </div>
        <div className="text-ink-3 mt-1 flex gap-1 text-center text-[0.65rem]" aria-hidden>
          {range.map((v) => (
            <span key={v} className="flex-1">
              {v}
            </span>
          ))}
        </div>
        {survey.kind === "enps" && n ? (
          <p className="text-ink-2 mt-2 text-xs">
            {promoters} promoters, {n - promoters - detractors} passive, {detractors} detractors
          </p>
        ) : null}
        <p className="sr-only">{dist.map((d, i) => `${range[i]}: ${d}`).join(", ")}</p>
        {comments.length ? (
          <div className="mt-4">
            <p className="text-sm font-medium">Comments</p>
            <ul className="text-ink-2 mt-1 space-y-1 text-sm">
              {comments.map((c, i) => (
                <li key={i}>&ldquo;{c}&rdquo;</li>
              ))}
            </ul>
          </div>
        ) : null}
        {canManage && survey.status === "open" ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() =>
              start(async () => {
                const r = await closeSurvey(survey.id);
                r.ok ? toast.success(r.message) : toast.error(r.error);
              })
            }
          >
            Close survey
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function NewSurvey() {
  return (
    <FormDialog
      title="Launch a survey"
      description="Everyone can answer once, anonymously."
      action={createSurvey}
      trigger={
        <Button variant="accent">
          <Plus aria-hidden /> Launch survey
        </Button>
      }
    >
      {() => (
        <>
          <Field label="Title" htmlFor="title">
            <input id="title" name="title" className="field" required placeholder="e.g. Hybrid work pulse" />
          </Field>
          <Field label="Question" htmlFor="question">
            <input id="question" name="question" className="field" required placeholder="How well is the 2-day office week working for you?" />
          </Field>
          <Field label="Scale" htmlFor="kind">
            <select id="kind" name="kind" className="field" defaultValue="pulse">
              <option value="pulse">1 to 5</option>
              <option value="enps">0 to 10 (eNPS)</option>
            </select>
          </Field>
          <div className="flex justify-end">
            <SubmitButton pendingLabel="Launching">Launch</SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}
