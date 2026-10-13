"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Plus, Sparkles, Loader2, Trash2, Star, Target } from "lucide-react";
import { aiDraftReview, createObjective, deleteObjective, saveReview, updateKeyResult } from "@/app/actions/performance";
import { Avatar, Button, Dialog, DialogContent, DialogTrigger, EmptyState, Field, Pill, Progress, Segmented } from "@/components/ui";
import { cn } from "@/lib/utils";

export type KR = { id: string; title: string; start: number; target: number; current: number; unit: string };
export type Objective = {
  id: string;
  title: string;
  quarter: string;
  owner: string;
  hue: number;
  ownerId: string;
  group: "mine" | "team" | "company";
  canEdit: boolean;
  krs: KR[];
};
export type Review = {
  id: string;
  employee: string;
  hue: number;
  title: string;
  reviewer: string;
  cycle: string;
  rating: number | null;
  strengths: string;
  growth: string;
  summary: string;
  status: "draft" | "submitted";
  aboutMe: boolean;
};

const progress = (k: KR) => (k.target === k.start ? 1 : Math.max(0, Math.min(1, (k.current - k.start) / (k.target - k.start))));
const tone = (p: number): "teal" | "marigold" | "rose" => (p >= 0.7 ? "teal" : p >= 0.4 ? "marigold" : "rose");
const fmt = (n: number, unit: string) => (unit === "₹L" ? `₹${n}L` : unit === "%" ? `${n}%` : `${n} ${unit}`);

function KrRow({ kr, canEdit }: { kr: KR; canEdit: boolean }) {
  const [val, setVal] = useState(String(kr.current));
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const p = progress(kr);
  const save = () =>
    start(async () => {
      const r = await updateKeyResult(kr.id, Number(val));
      r.ok ? toast.success(r.message) : toast.error(r.error);
      setEditing(false);
    });
  return (
    <li className="grid gap-2 py-2.5 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-center">
      <div className="min-w-0">
        <p className="text-sm">{kr.title}</p>
        <p className="text-ink-3 tabular text-xs">
          {fmt(kr.start, kr.unit)} to {fmt(kr.target, kr.unit)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Progress value={p} tone={tone(p)} label={kr.title} />
        </div>
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="flex items-center gap-1"
          >
            <label className="sr-only" htmlFor={`kr-${kr.id}`}>
              Current value
            </label>
            <input
              id={`kr-${kr.id}`}
              autoFocus
              type="number"
              step="any"
              className="field tabular h-8 w-20 px-2 py-1 text-sm"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onBlur={() => !pending && setEditing(false)}
            />
            {pending ? <Loader2 className="text-ink-3 size-4 animate-spin" aria-hidden /> : null}
          </form>
        ) : (
          <button
            disabled={!canEdit}
            onClick={() => setEditing(true)}
            className={cn("tabular w-20 rounded-md px-2 py-1 text-right text-sm font-medium", canEdit && "hover:bg-surface-2")}
            aria-label={`${kr.title}: ${fmt(kr.current, kr.unit)}${canEdit ? ". Click to update" : ""}`}
          >
            {fmt(kr.current, kr.unit)}
          </button>
        )}
      </div>
    </li>
  );
}

function ObjectiveCard({ o }: { o: Objective }) {
  const p = o.krs.length ? o.krs.reduce((s, k) => s + progress(k), 0) / o.krs.length : 0;
  const [pending, start] = useTransition();
  return (
    <motion.article layout className="panel p-5">
      <header className="flex items-start gap-3">
        <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0 -rotate-90" aria-hidden>
          <circle cx="22" cy="22" r="18" fill="none" stroke="var(--surface-2)" strokeWidth="5" />
          <motion.circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke={`var(--${tone(p) === "teal" ? "teal" : tone(p) === "marigold" ? "marigold" : "rose"})`}
            strokeWidth="5"
            strokeLinecap="round"
            initial={{ strokeDasharray: "0 113" }}
            animate={{ strokeDasharray: `${p * 113} 113` }}
            transition={{ duration: 0.9 }}
          />
        </svg>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-snug font-semibold">{o.title}</h3>
          <p className="text-ink-2 mt-0.5 flex items-center gap-2 text-sm">
            <Avatar name={o.owner} hue={o.hue} size={20} /> {o.owner}, {Math.round(p * 100)}% there
          </p>
        </div>
        {o.group === "mine" ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remove goal"
            disabled={pending}
            onClick={() =>
              confirm("Remove this goal and its key results?") &&
              start(async () => {
                const r = await deleteObjective(o.id);
                r.ok ? toast.success(r.message) : toast.error(r.error);
              })
            }
          >
            <Trash2 />
          </Button>
        ) : null}
      </header>
      <ul className="divide-line mt-3 divide-y">
        {o.krs.map((k) => (
          <KrRow key={k.id} kr={k} canEdit={o.canEdit} />
        ))}
      </ul>
    </motion.article>
  );
}

function NewObjective() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [krs, setKrs] = useState([{ title: "", start: "0", target: "100", unit: "%" }]);
  const [pending, start] = useTransition();
  const submit = () =>
    start(async () => {
      const r = await createObjective({
        title,
        krs: krs.filter((k) => k.title.trim()).map((k) => ({ title: k.title, start: Number(k.start), target: Number(k.target), unit: k.unit })),
      });
      if (r.ok) {
        toast.success(r.message);
        setOpen(false);
        setTitle("");
        setKrs([{ title: "", start: "0", target: "100", unit: "%" }]);
      } else toast.error(r.error);
    });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus aria-hidden /> Add a goal
        </Button>
      </DialogTrigger>
      <DialogContent title="Add a goal" description="An outcome you want this quarter, measured by 1–5 key results.">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-4"
        >
          <Field label="Goal" htmlFor="obj-title">
            <input
              id="obj-title"
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={5}
              placeholder="e.g. Make onboarding painless for new joiners"
            />
          </Field>
          <fieldset className="space-y-2">
            <legend className="label">Key results</legend>
            {krs.map((k, i) => (
              <div key={i} className="grid grid-cols-[1fr_64px_64px_56px] gap-2">
                <input
                  aria-label={`Key result ${i + 1}`}
                  className="field"
                  value={k.title}
                  onChange={(e) => setKrs(krs.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                  placeholder="What you'll measure"
                />
                <input
                  aria-label="Start"
                  className="field tabular px-2"
                  type="number"
                  step="any"
                  value={k.start}
                  onChange={(e) => setKrs(krs.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))}
                />
                <input
                  aria-label="Target"
                  className="field tabular px-2"
                  type="number"
                  step="any"
                  value={k.target}
                  onChange={(e) => setKrs(krs.map((x, j) => (j === i ? { ...x, target: e.target.value } : x)))}
                />
                <input
                  aria-label="Unit"
                  className="field px-2"
                  value={k.unit}
                  onChange={(e) => setKrs(krs.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)))}
                />
              </div>
            ))}
            <p className="text-ink-3 text-xs">Start, target and unit for each. A lower target works too, e.g. response time from 12 to 3 s.</p>
            {krs.length < 5 ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setKrs([...krs, { title: "", start: "0", target: "100", unit: "%" }])}>
                <Plus aria-hidden /> Another key result
              </Button>
            ) : null}
          </fieldset>
          <div className="flex justify-end">
            <Button type="submit" variant="accent" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" aria-hidden /> : null} Add goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Stars({ value, onChange, readOnly }: { value: number | null; onChange?: (v: number) => void; readOnly?: boolean }) {
  const labels = ["Below expectations", "Partly met", "Met expectations", "Exceeded", "Outstanding"];
  return (
    <div
      role={readOnly ? "img" : "radiogroup"}
      aria-label={value ? `Rating ${value} of 5, ${labels[value - 1]}` : "Rating"}
      className="flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role={readOnly ? undefined : "radio"}
          aria-checked={readOnly ? undefined : value === n}
          aria-label={labels[n - 1]}
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={cn("rounded p-0.5", !readOnly && "hover:scale-110")}
        >
          <Star className={cn("size-5 transition-colors", value && n <= value ? "fill-marigold text-marigold" : "text-line-strong")} />
        </button>
      ))}
      {value ? <span className="text-ink-2 ml-2 text-sm">{labels[value - 1]}</span> : null}
    </div>
  );
}

function ReviewEditor({ r }: { r: Review }) {
  const [strengths, setStrengths] = useState(r.strengths);
  const [growth, setGrowth] = useState(r.growth);
  const [summary, setSummary] = useState(r.summary);
  const [rating, setRating] = useState<number | null>(r.rating);
  const [drafting, startDraft] = useTransition();
  const [saving, startSave] = useTransition();
  const [open, setOpen] = useState(false);

  const draft = () =>
    startDraft(async () => {
      const res = await aiDraftReview(r.id, { strengths, growth });
      if (res.ok && res.data) {
        setSummary(res.data.summary);
        if (!rating) setRating(res.data.rating);
        toast.success(res.message);
      } else if (!res.ok) toast.error(res.error);
    });
  const save = (submit: boolean) =>
    startSave(async () => {
      const res = await saveReview({ id: r.id, strengths, growth, summary, rating, submit });
      if (res.ok) {
        toast.success(res.message);
        if (submit) setOpen(false);
      } else toast.error(res.error);
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={r.status === "draft" ? "primary" : "outline"} size="sm">
          {r.status === "draft" ? "Write review" : "View"}
        </Button>
      </DialogTrigger>
      <DialogContent
        side="right"
        title={`${r.employee}, ${r.cycle}`}
        description={r.status === "draft" ? "Jot notes, let AI draft the summary, then edit and submit." : `Submitted by ${r.reviewer}`}
      >
        {r.status === "submitted" ? (
          <div className="space-y-4 text-sm">
            <Stars value={r.rating} readOnly />
            <p className="whitespace-pre-line">{r.summary}</p>
            {r.strengths ? (
              <div>
                <p className="font-medium">Strengths</p>
                <p className="text-ink-2">{r.strengths}</p>
              </div>
            ) : null}
            {r.growth ? (
              <div>
                <p className="font-medium">To grow</p>
                <p className="text-ink-2">{r.growth}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="Strengths you saw" htmlFor={`s-${r.id}`}>
              <textarea
                id={`s-${r.id}`}
                className="field min-h-20"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="Specific things they did well"
              />
            </Field>
            <Field label="Where they can grow" htmlFor={`g-${r.id}`}>
              <textarea id={`g-${r.id}`} className="field min-h-20" value={growth} onChange={(e) => setGrowth(e.target.value)} />
            </Field>
            <div className="bg-surface-2 flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5">
              <p className="text-ink-2 text-sm">Uses your notes, their goal progress and kudos.</p>
              <Button variant="outline" size="sm" onClick={draft} disabled={drafting}>
                {drafting ? <Loader2 className="animate-spin" aria-hidden /> : <Sparkles aria-hidden />} Draft summary
              </Button>
            </div>
            <Field label="Summary they'll read" htmlFor={`sum-${r.id}`}>
              <textarea
                id={`sum-${r.id}`}
                className={cn("field min-h-40", drafting && "animate-pulse")}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </Field>
            <div>
              <p className="label">Rating</p>
              <Stars value={rating} onChange={setRating} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => save(false)} disabled={saving}>
                Save draft
              </Button>
              <Button variant="accent" onClick={() => save(true)} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" aria-hidden /> : null} Submit and share
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PerformanceView({ objectives, reviews, hasTeam }: { objectives: Objective[]; reviews: Review[]; hasTeam: boolean }) {
  const [tab, setTab] = useState<"goals" | "reviews">("goals");
  const [scope, setScope] = useState<"mine" | "team" | "company">("mine");
  const shown = objectives.filter((o) => o.group === scope);
  const toWrite = reviews.filter((r) => !r.aboutMe);
  const aboutMe = reviews.filter((r) => r.aboutMe);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Section"
          value={tab}
          onChange={setTab}
          options={[
            { value: "goals", label: "Goals" },
            { value: "reviews", label: "Reviews", count: toWrite.filter((r) => r.status === "draft").length || undefined },
          ]}
        />
        {tab === "goals" ? <NewObjective /> : null}
      </div>

      {tab === "goals" ? (
        <>
          <div className="flex gap-1.5" role="group" aria-label="Whose goals">
            {([["mine", "Mine"], ...(hasTeam ? [["team", "My team"]] : []), ["company", "Company"]] as [typeof scope, string][]).map(([v, l]) => (
              <button
                key={v}
                aria-pressed={scope === v}
                onClick={() => setScope(v)}
                className={cn("rounded-full border px-3 py-1 text-sm", scope === v ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink-2")}
              >
                {l}
              </button>
            ))}
          </div>
          {shown.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {shown.map((o) => (
                <ObjectiveCard key={o.id} o={o} />
              ))}
            </div>
          ) : (
            <div className="panel">
              <EmptyState icon={<Target />} title={scope === "mine" ? "No goals yet" : "Nothing here yet"}>
                {scope === "mine" ? "Add one outcome you want this quarter and how you'll know you got there." : "Goals your team sets will show up here."}
              </EmptyState>
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="panel">
            <h2 className="border-line font-display border-b px-5 py-3.5 font-semibold">Reviews you&apos;re writing</h2>
            {toWrite.length ? (
              <ul className="divide-line divide-y">
                {toWrite.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={r.employee} hue={r.hue} size={34} />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium">{r.employee}</p>
                      <p className="text-ink-2">
                        {r.cycle}
                        {r.rating ? `, rated ${r.rating}/5` : ""}
                      </p>
                    </div>
                    {r.status === "draft" ? <Pill t="warn">Due</Pill> : <Pill t="good">Shared</Pill>}
                    <ReviewEditor r={r} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-2 px-5 py-6 text-sm">You have no reviews to write this cycle.</p>
            )}
          </section>
          <section className="panel">
            <h2 className="border-line font-display border-b px-5 py-3.5 font-semibold">Your reviews</h2>
            {aboutMe.length ? (
              <ul className="divide-line divide-y">
                {aboutMe.map((r) => (
                  <li key={r.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{r.cycle}</p>
                      <Stars value={r.rating} readOnly />
                    </div>
                    <p className="text-ink-2 mt-2 text-sm">{r.summary}</p>
                    <p className="text-ink-3 mt-1 text-xs">From {r.reviewer}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-2 px-5 py-6 text-sm">Shared reviews about you will appear here.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
