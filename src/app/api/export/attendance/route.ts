import { and, eq, like } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getCurrentUser, isPeopleTeam } from "@/lib/auth";
import { formatTime } from "@/lib/utils";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in first.", { status: 401 });
  if (!isPeopleTeam(user)) return new Response("Only the People team can export attendance.", { status: 403 });
  const month = new URL(req.url).searchParams.get("month") ?? "";
  if (!/^\d{4}-\d{2}$/.test(month)) return new Response("Use ?month=YYYY-MM", { status: 400 });

  const db = await getDb();
  const rows = await db
    .select({
      code: schema.employees.code,
      name: schema.employees.name,
      date: schema.attendance.date,
      checkIn: schema.attendance.checkIn,
      checkOut: schema.attendance.checkOut,
      mode: schema.attendance.mode,
      note: schema.attendance.note,
    })
    .from(schema.attendance)
    .innerJoin(schema.employees, eq(schema.attendance.employeeId, schema.employees.id))
    .where(and(like(schema.attendance.date, `${month}-%`)))
    .orderBy(schema.attendance.date, schema.employees.name);

  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const hours = (a: string | null, b: string | null) => (a && b ? ((Date.parse(b) - Date.parse(a)) / 3_600_000).toFixed(2) : "");
  const csv = [
    ["Employee ID", "Name", "Date", "In (IST)", "Out (IST)", "Hours", "Mode", "Note"].join(","),
    ...rows.map((r) =>
      [r.code, r.name, r.date, r.checkIn ? formatTime(r.checkIn) : "", r.checkOut ? formatTime(r.checkOut) : "", hours(r.checkIn, r.checkOut), r.mode, r.note]
        .map(esc)
        .join(","),
    ),
  ].join("\n");

  return new Response(csv, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="attendance-${month}.csv"` },
  });
}
