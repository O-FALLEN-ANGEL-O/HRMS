"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal } from "lucide-react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { addAsset, assignAsset, setAssetStatus } from "@/app/actions/support";
import { FormDialog } from "@/components/form-dialog";
import { Avatar, Button, Dialog, DialogContent, Field, StatusPill, SubmitButton } from "@/components/ui";
import { cn, formatDate, formatINR } from "@/lib/utils";

type Item = {
  id: string;
  tag: string;
  name: string;
  category: string;
  serial: string | null;
  status: string;
  assignedTo: string | null;
  assignedOn: string | null;
  cost: number;
  holder: string | null;
  holderHue: number | null;
};

export function Inventory({ items, people }: { items: Item[]; people: { id: string; name: string }[] }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [assigning, setAssigning] = useState<Item | null>(null);
  const [to, setTo] = useState("");
  const [pending, start] = useTransition();
  const shown = useMemo(
    () =>
      items.filter(
        (i) =>
          (filter === "all" || i.status === filter) && (!q || `${i.tag} ${i.name} ${i.holder ?? ""} ${i.serial ?? ""}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [items, filter, q],
  );

  const act = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    start(async () => {
      const r = await fn();
      r.ok ? toast.success(r.message) : toast.error(r.error);
    });

  return (
    <section className="panel overflow-hidden">
      <div className="border-line flex flex-col gap-3 border-b px-5 py-3 sm:flex-row sm:items-center">
        <label htmlFor="asset-q" className="sr-only">
          Search assets
        </label>
        <input id="asset-q" className="field sm:max-w-xs" placeholder="Tag, item, person or serial" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {["all", "assigned", "available", "repair", "retired"].map((s) => (
            <button
              key={s}
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
              className={cn("rounded-full border px-3 py-1 text-sm capitalize", filter === s ? "border-ink bg-ink text-paper" : "border-line text-ink-2")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-ink-3 text-left">
            <tr className="border-line border-b">
              <th className="px-5 py-2.5 font-medium">Tag</th>
              <th className="px-3 py-2.5 font-medium">Item</th>
              <th className="px-3 py-2.5 font-medium">With</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 text-right font-medium">Cost</th>
              <th className="px-5 py-2.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {shown.map((i) => (
              <tr key={i.id}>
                <td className="tabular px-5 py-2.5 font-medium">{i.tag}</td>
                <td className="px-3 py-2.5">
                  {i.name}
                  <span className="text-ink-3 block text-xs">{i.serial}</span>
                </td>
                <td className="px-3 py-2.5">
                  {i.holder ? (
                    <span className="flex items-center gap-2">
                      <Avatar name={i.holder} hue={i.holderHue ?? 200} size={24} /> {i.holder}
                      <span className="text-ink-3 text-xs">since {formatDate(i.assignedOn)}</span>
                    </span>
                  ) : (
                    <span className="text-ink-3">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <StatusPill status={i.status} />
                </td>
                <td className="tabular px-3 py-2.5 text-right">{formatINR(i.cost)}</td>
                <td className="px-5 py-2.5 text-right">
                  <Menu.Root>
                    <Menu.Trigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Actions for ${i.tag}`} disabled={pending}>
                        <MoreHorizontal />
                      </Button>
                    </Menu.Trigger>
                    <Menu.Portal>
                      <Menu.Content align="end" className="border-line bg-surface z-50 min-w-44 rounded-[10px] border p-1 text-sm shadow-[var(--shadow)]">
                        {i.status !== "retired" ? (
                          <Menu.Item
                            className="data-[highlighted]:bg-surface-2 cursor-pointer rounded-md px-2.5 py-1.5 outline-none"
                            onSelect={() => {
                              setTo(i.assignedTo ?? "");
                              setAssigning(i);
                            }}
                          >
                            {i.assignedTo ? "Reassign" : "Assign to someone"}
                          </Menu.Item>
                        ) : null}
                        {i.assignedTo ? (
                          <Menu.Item
                            className="data-[highlighted]:bg-surface-2 cursor-pointer rounded-md px-2.5 py-1.5 outline-none"
                            onSelect={() => act(() => assignAsset(i.id, null))}
                          >
                            Mark returned
                          </Menu.Item>
                        ) : null}
                        {i.status !== "repair" && i.status !== "retired" ? (
                          <Menu.Item
                            className="data-[highlighted]:bg-surface-2 cursor-pointer rounded-md px-2.5 py-1.5 outline-none"
                            onSelect={() => act(() => setAssetStatus(i.id, "repair"))}
                          >
                            Send for repair
                          </Menu.Item>
                        ) : null}
                        {i.status === "repair" ? (
                          <Menu.Item
                            className="data-[highlighted]:bg-surface-2 cursor-pointer rounded-md px-2.5 py-1.5 outline-none"
                            onSelect={() => act(() => setAssetStatus(i.id, "available"))}
                          >
                            Back from repair
                          </Menu.Item>
                        ) : null}
                        {i.status !== "retired" ? (
                          <Menu.Item
                            className="text-rose data-[highlighted]:bg-rose-soft cursor-pointer rounded-md px-2.5 py-1.5 outline-none"
                            onSelect={() => act(() => setAssetStatus(i.id, "retired"))}
                          >
                            Retire
                          </Menu.Item>
                        ) : null}
                      </Menu.Content>
                    </Menu.Portal>
                  </Menu.Root>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 ? <p className="text-ink-2 px-5 py-8 text-center text-sm">No assets match.</p> : null}
      </div>
      <Dialog open={!!assigning} onOpenChange={(o) => !o && setAssigning(null)}>
        {assigning ? (
          <DialogContent title={`Assign ${assigning.tag}`} description={assigning.name}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                act(() => assignAsset(assigning.id, to));
                setAssigning(null);
              }}
              className="space-y-4"
            >
              <Field label="Give it to" htmlFor="assignee">
                <select id="assignee" className="field" value={to} onChange={(e) => setTo(e.target.value)} required>
                  <option value="" disabled>
                    Choose someone
                  </option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex justify-end">
                <Button type="submit">Assign</Button>
              </div>
            </form>
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  );
}

export function AddAsset() {
  return (
    <FormDialog
      title="Add an asset"
      action={addAsset}
      trigger={
        <Button variant="accent">
          <Plus aria-hidden /> Add asset
        </Button>
      }
    >
      {() => (
        <>
          <Field label="Item" htmlFor="name">
            <input id="name" name="name" className="field" required placeholder='e.g. MacBook Air 13" M4' />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" htmlFor="category">
              <select id="category" name="category" className="field">
                <option value="laptop">Laptop</option>
                <option value="monitor">Monitor</option>
                <option value="phone">Phone</option>
                <option value="accessory">Accessory</option>
                <option value="furniture">Furniture</option>
              </select>
            </Field>
            <Field label="Cost (₹)" htmlFor="cost">
              <input id="cost" name="cost" type="number" min={0} className="field tabular" required />
            </Field>
          </div>
          <Field label="Serial number" htmlFor="serial">
            <input id="serial" name="serial" className="field" />
          </Field>
          <div className="flex justify-end">
            <SubmitButton pendingLabel="Adding">Add asset</SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}
