"use client";

import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts";
import { Panel, Stat } from "@/components/ui";

type Point = { label: string; value: number };

const axis = { stroke: "var(--ink-3)", fontSize: 12, tickLine: false, axisLine: false } as const;

function Tip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number }[]; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-line bg-surface rounded-[8px] border px-3 py-2 text-sm shadow-[var(--shadow)]">
      <p className="text-ink-2">{label}</p>
      <p className="font-display tabular font-semibold">
        {payload[0]!.value}
        {unit}
      </p>
    </div>
  );
}

/** Each chart can flip to a plain table, so no reading depends on the picture. */
function ChartPanel({ title, data, unit = "", children }: { title: string; data: Point[]; unit?: string; children: React.ReactNode }) {
  const [table, setTable] = useState(false);
  return (
    <Panel
      title={title}
      action={
        <button className="text-sky text-sm hover:underline" onClick={() => setTable((t) => !t)} aria-pressed={table}>
          {table ? "Show chart" : "Show table"}
        </button>
      }
    >
      {table ? (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <tbody className="divide-line divide-y">
              {data.map((d) => (
                <tr key={d.label}>
                  <td className="text-ink-2 py-1.5">{d.label}</td>
                  <td className="tabular py-1.5 text-right">
                    {d.value}
                    {unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-64" role="img" aria-label={`${title}: ${data.map((d) => `${d.label} ${d.value}${unit}`).join(", ")}`}>
          {children}
        </div>
      )}
    </Panel>
  );
}

export function Charts({
  tiles,
  headcount,
  byDept,
  attendance,
  leaveByType,
  company,
}: {
  tiles: { label: string; value: string; sub: string }[];
  headcount: Point[];
  byDept: Point[];
  attendance: Point[];
  leaveByType: Point[];
  company: boolean;
}) {
  return (
    <div className="space-y-6">
      <section aria-label="Key numbers" className="panel bg-line grid grid-cols-2 gap-px overflow-hidden sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="bg-surface px-4 py-4">
            <Stat label={t.label} value={t.value} sub={t.sub} />
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Headcount, last 12 months" data={headcount}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={headcount} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="hc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ink)" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="var(--ink)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="label" {...axis} />
              <YAxis allowDecimals={false} {...axis} domain={[0, "auto"]} />
              <Tooltip content={<Tip />} cursor={{ stroke: "var(--ink-3)", strokeDasharray: "3 3" }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--ink)"
                strokeWidth={2}
                fill="url(#hc)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--surface)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Attendance, last 20 working days" data={attendance} unit="%">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendance} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap={2}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="label" {...axis} interval={3} />
              <YAxis domain={[0, 100]} {...axis} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<Tip unit="% present" />} cursor={{ fill: "var(--surface-2)" }} />
              <Bar dataKey="value" fill="var(--sky)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        {company ? (
          <ChartPanel title="People by team" data={byDept}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDept} layout="vertical" margin={{ top: 0, right: 32, left: 8, bottom: 0 }} barCategoryGap={8}>
                <XAxis type="number" dataKey="value" hide allowDecimals={false} domain={[0, "dataMax"]} />
                <YAxis type="category" dataKey="label" {...axis} width={140} />
                <Tooltip content={<Tip unit=" people" />} cursor={{ fill: "var(--surface-2)" }} />
                <Bar dataKey="value" fill="var(--ink)" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  <LabelList dataKey="value" position="right" fill="var(--ink-2)" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        ) : null}

        <ChartPanel title="Leave days taken this year" data={leaveByType} unit=" days">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leaveByType} layout="vertical" margin={{ top: 0, right: 32, left: 8, bottom: 0 }} barCategoryGap={8}>
              <XAxis type="number" dataKey="value" hide domain={[0, "dataMax"]} />
              <YAxis type="category" dataKey="label" {...axis} width={110} />
              <Tooltip content={<Tip unit=" days" />} cursor={{ fill: "var(--surface-2)" }} />
              <Bar dataKey="value" fill="var(--teal)" radius={[0, 4, 4, 0]} maxBarSize={22}>
                <LabelList dataKey="value" position="right" fill="var(--ink-2)" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </div>
  );
}
