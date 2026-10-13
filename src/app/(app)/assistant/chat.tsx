"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, BookOpen, Sparkles } from "lucide-react";
import { ask } from "@/app/actions/support";
import { Button, Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string; sources?: string[]; source?: "ai" | "rules" };

const SUGGESTIONS = [
  "How many casual leave days do I have left?",
  "Can I claim my home internet bill?",
  "What's the notice period if I resign?",
  "Can I add my parents to health insurance?",
  "When do salaries get paid?",
];

export function Chat({ firstName, policies }: { firstName: string; policies: string[] }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || pending) return;
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    start(async () => {
      const r = await ask(q, history);
      setMessages((m) => [
        ...m,
        r.ok && r.data
          ? { role: "assistant", content: r.data.answer, sources: r.data.sources, source: r.data.source }
          : { role: "assistant", content: r.ok ? "I couldn't answer that." : r.error },
      ]);
      inputRef.current?.focus();
    });
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-3xl flex-col">
      <div className="flex-1">
        {messages.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-10">
            <span className="bg-marigold-soft text-marigold-ink mb-4 grid size-12 place-items-center rounded-full">
              <Sparkles className="size-6" aria-hidden />
            </span>
            <h1 className="text-3xl">What do you need to know, {firstName}?</h1>
            <p className="text-ink-2 mt-2 max-w-[56ch]">
              I answer from Northwind&apos;s own policies and your leave balances. If something isn&apos;t covered, I&apos;ll say so and point you to the{" "}
              <Link className="link" href="/helpdesk?new=1">
                helpdesk
              </Link>
              .
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => send(s)}
                    className="border-line bg-surface hover:border-line-strong hover:bg-surface-2 rounded-full border px-3.5 py-2 text-left text-sm"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
            <details className="text-ink-2 mt-8 text-sm">
              <summary className="cursor-pointer">What it knows</summary>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {policies.map((p) => (
                  <li key={p}>
                    <Pill>{p}</Pill>
                  </li>
                ))}
              </ul>
            </details>
          </motion.div>
        ) : (
          <ol className="space-y-5 py-4" aria-live="polite">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn("max-w-[85%] rounded-[16px] px-4 py-3", m.role === "user" ? "bg-ink text-paper rounded-br-[6px]" : "panel rounded-bl-[6px]")}
                  >
                    <p className="whitespace-pre-line">{m.content}</p>
                    {m.role === "assistant" && (m.sources?.length || m.source) ? (
                      <div className="border-line text-ink-3 mt-2.5 flex flex-wrap items-center gap-1.5 border-t pt-2 text-xs">
                        <BookOpen className="size-3.5" aria-hidden />
                        {m.sources?.length ? m.sources.map((s) => <Pill key={s}>{s}</Pill>) : <span>No matching policy</span>}
                        <span className="ml-auto">{m.source === "ai" ? "Workers AI" : "Policy search"}</span>
                      </div>
                    ) : null}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
            {pending ? (
              <li className="flex">
                <div className="panel flex gap-1 rounded-bl-[6px] px-4 py-4" aria-label="Thinking">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="bg-ink-3 size-2 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              </li>
            ) : null}
            <div ref={end} />
          </ol>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-4 mt-4"
      >
        <div className="panel flex items-end gap-2 p-2 shadow-[var(--shadow)]">
          <label htmlFor="ask" className="sr-only">
            Ask a question
          </label>
          <textarea
            id="ask"
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about leave, pay, benefits, policies…"
            className="placeholder:text-ink-3 max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 outline-none"
          />
          <Button type="submit" size="icon" variant="accent" disabled={!input.trim() || pending} aria-label="Send">
            <ArrowUp />
          </Button>
        </div>
        <p className="text-ink-3 mt-1.5 px-2 text-xs">Answers can be wrong. Check the policy or ask HR before acting on anything important.</p>
      </form>
    </div>
  );
}
