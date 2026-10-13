"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, X, Inbox, AlertTriangle } from "lucide-react";
import { approveAll, decide } from "@/app/actions/workday";
import { AnimatedItem, AnimatedList, Avatar, Button, EmptyState, Segmented } from "@/components/ui";
import { timeAgo } from "@/lib/utils";

export type ApprovalRow = {
  id: string;
  kind: "leave" | "regularization" | "expense";
  name: string;
  hue: number;
  title: string;
  mine: boolean;
  headline: string;
  detail: string;
  reason: string;
  createdAt: string;
  context: string[];
  warn: boolean;
};

type Tab = "leave" | "regularization" | "expense";

function Row({ row, onDone }: { row: ApprovalRow; onDone: (id: string) => void }) {
  const [declining, setDeclining] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  const act = (decision: "approved" | "rejected") =>
    start(async () => {
      onDone(row.id);
      const r = await decide(row.kind, { id: row.id, decision, note: note || undefined });
      r.ok ? toast.success(r.message) : toast.error(r.error);
    });

  return (
    <AnimatedItem className="border-b border-line last:border-b-0">
      <div className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="flex min-w-0 gap-3">
          <Avatar name={row.name} hue={row.hue} size={38} />
          <div className="min-w-0">
            <p className="text-sm">
              <span className="font-semibold">{row.name}</span> <span className="text-ink-3">{row.title}</span>
            </p>
            <p className="mt-0.5 font-display text-[1.05rem] font-semibold">{row.headline}</p>
            <p className="text-sm text-ink-2">{row.detail}</p>
            <p className="mt-2 max-w-[60ch] text-sm">&ldquo;{row.reason}&rdquo;</p>
            {row.context.length ? (
              <ul className="mt-2 space-y-0.5 text-sm text-ink-2">
                {row.context.map((c, i) => (
                  <li key={i} className={row.warn && c.startsWith("Also off") ? "flex items-center gap-1.5 text-marigold-ink" : ""}>
                    {row.warn && c.startsWith("Also off") ? <AlertTriangle className="size-3.5" aria-hidden /> : null}
                    {c}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-2 text-xs text-ink-3">Requested {timeAgo(row.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:w-56">
          {declining ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                act("rejected");
              }}
              className="space-y-2"
            >
              <label className="sr-only" htmlFor={`note-${row.id}`}>
                Reason for declining
              </label>
              <textarea id={`note-${row.id}`} autoFocus className="field min-h-20 text-sm" placeholder="Tell them why, or suggest other dates" value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="flex gap-2">
                <Button type="submit" variant="danger" size="sm" className="flex-1" disabled={pending}>
                  Decline
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setDeclining(false)}>
                  Back
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex gap-2 md:flex-col">
              <Button variant="approve" className="flex-1 md:w-full md:flex-none" onClick={() => act("approved")} disabled={pending}>
                <Check aria-hidden /> Approve
              </Button>
              <Button variant="outline" className="flex-1 md:w-full md:flex-none" onClick={() => setDeclining(true)} disabled={pending}>
                <X aria-hidden /> Decline
              </Button>
            </div>
          )}
        </div>
      </div>
    </AnimatedItem>
  );
}

export function ApprovalsBoard({ leave, regularizations, expenses, peopleTeam }: { leave: ApprovalRow[]; regularizations: ApprovalRow[]; expenses: ApprovalRow[]; peopleTeam: boolean }) {
  const [tab, setTab] = useState<Tab>(leave.length ? "leave" : regularizations.length ? "regularization" : "expense");
  const [hidden, hide] = useOptimistic<string[], string>([], (s, id) => [...s, id]);
  const [, start] = useTransition();
  const all = { leave, regularization: regularizations, expense: expenses };
  const rows = all[tab].filter((r) => !hidden.includes(r.id));
  const mine = rows.filter((r) => r.mine);
  const others = rows.filter((r) => !r.mine);
  const count = (t: Tab) => all[t].filter((r) => !hidden.includes(r.id)).length;

  const bulk = () =>
    start(async () => {
      const ids = (mine.length ? mine : rows).map((r) => r.id);
      ids.forEach(hide);
      const r = await approveAll(tab, ids);
      r.ok ? toast.success(r.message) : toast.error(r.error);
    });

  const section = (title: string | null, list: ApprovalRow[]) =>
    list.length ? (
      <section className="panel overflow-hidden">
        {title ? <h2 className="border-b border-line px-5 py-3 font-display font-semibold">{title}</h2> : null}
        <AnimatedList>
          {list.map((r) => (
            <Row key={r.id} row={r} onDone={(id) => start(() => hide(id))} />
          ))}
        </AnimatedList>
      </section>
    ) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Request type"
          value={tab}
          onChange={setTab}
          options={[
            { value: "leave", label: "Time off", count: count("leave") },
            { value: "regularization", label: "Attendance", count: count("regularization") },
            { value: "expense", label: "Expenses", count: count("expense") },
          ]}
        />
        {rows.length > 1 ? (
          <Button variant="outline" size="sm" onClick={bulk}>
            <Check aria-hidden /> Approve all {mine.length && peopleTeam ? "from your team" : ""} ({(mine.length ? mine : rows).length})
          </Button>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <div className="panel">
          <EmptyState icon={<Inbox />} title="Nothing waiting here">
            New requests from your team show up here and in your notifications.
          </EmptyState>
        </div>
      ) : peopleTeam ? (
        <>
          {section("Your team", mine)}
          {section("Everyone else", others)}
        </>
      ) : (
        section(null, rows)
      )}
    </div>
  );
}
