"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Avatar, Button, Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

type P = { id: string; name: string; title: string; hue: number; managerId: string | null; department: string; departmentHue: number; status: string };

export function OrgTree({ people, meId }: { people: P[]; meId: string }) {
  const children = useMemo(() => {
    const m = new Map<string | null, P[]>();
    for (const p of people) {
      const key = p.managerId && people.some((x) => x.id === p.managerId) ? p.managerId : null;
      m.set(key, [...(m.get(key) ?? []), p]);
    }
    return m;
  }, [people]);
  const size = useMemo(() => {
    const memo = new Map<string, number>();
    const count = (id: string): number => {
      if (memo.has(id)) return memo.get(id)!;
      const n = (children.get(id) ?? []).reduce((s, c) => s + 1 + count(c.id), 0);
      memo.set(id, n);
      return n;
    };
    return count;
  }, [children]);

  // Open the path to me by default, plus the top level.
  const initial = useMemo(() => {
    const open = new Set<string>();
    for (const r of children.get(null) ?? []) open.add(r.id);
    let cur = people.find((p) => p.id === meId)?.managerId;
    while (cur) {
      open.add(cur);
      cur = people.find((p) => p.id === cur)?.managerId ?? null;
    }
    return open;
  }, [children, people, meId]);
  const [open, setOpen] = useState<Set<string>>(initial);
  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const render = (list: P[], depth: number) => (
    <ul
      role={depth === 0 ? "tree" : "group"}
      aria-label={depth === 0 ? "Organisation" : undefined}
      className={cn(depth > 0 && "border-line-strong ml-5 border-l pl-4 sm:ml-7 sm:pl-6")}
    >
      {list.map((p) => {
        const kids = children.get(p.id) ?? [];
        const isOpen = open.has(p.id);
        return (
          <li key={p.id} role="treeitem" aria-expanded={kids.length ? isOpen : undefined} aria-selected={p.id === meId} className="relative py-1">
            {depth > 0 ? <span aria-hidden className="bg-line-strong absolute top-[30px] -left-4 h-px w-4 sm:-left-6 sm:w-6" /> : null}
            <div
              className={cn(
                "bg-surface flex items-center gap-2 rounded-[12px] border px-3 py-2.5",
                p.id === meId ? "border-marigold shadow-[0_0_0_3px_var(--marigold-soft)]" : "border-line",
              )}
            >
              {kids.length ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-1 size-7"
                  onClick={() => toggle(p.id)}
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${p.name}'s team`}
                >
                  <ChevronRight className={cn("transition-transform", isOpen && "rotate-90")} />
                </Button>
              ) : (
                <span className="w-6" aria-hidden />
              )}
              <span className="h-8 w-1 rounded-full" style={{ background: `oklch(0.68 0.12 ${p.departmentHue})` }} aria-hidden />
              <Avatar name={p.name} hue={p.hue} size={36} />
              <Link href={`/people/${p.id}`} className="min-w-0 flex-1 hover:underline">
                <span className="block truncate text-sm font-medium">
                  {p.name}
                  {p.id === meId ? <span className="text-marigold-ink ml-1.5 text-xs font-normal">you</span> : null}
                </span>
                <span className="text-ink-2 block truncate text-xs">
                  {p.title}, {p.department}
                </span>
              </Link>
              {p.status !== "active" ? <Pill t="warn">{p.status === "onboarding" ? "Joining" : "Leaving"}</Pill> : null}
              {kids.length ? <span className="text-ink-3 tabular hidden text-xs sm:inline">{size(p.id)} people</span> : null}
            </div>
            <AnimatePresence initial={false}>
              {kids.length && isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  {render(kids, depth + 1)}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(new Set(people.map((p) => p.id)))}>
          Expand all
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(new Set((children.get(null) ?? []).map((p) => p.id)))}>
          Collapse
        </Button>
      </div>
      {render(children.get(null) ?? [], 0)}
    </div>
  );
}
