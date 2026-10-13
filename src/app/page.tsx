import Link from "next/link";
import { eq, and, isNotNull, ne } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getCurrentUser } from "@/lib/auth";
import { todayIST } from "@/lib/utils";
import { Landing, type Persona } from "./landing";

export const dynamic = "force-dynamic";

const PERSONAS: Omit<Persona, "hue">[] = [
  {
    code: "E001",
    role: "admin",
    name: "Meera Iyer",
    title: "Head of Operations",
    does: "Runs payroll, sees company-wide analytics, manages assets and resets the demo.",
  },
  { code: "E002", role: "hr", name: "Arjun Rao", title: "HR Business Partner", does: "Onboards two new joiners, offboards one, handles tickets and surveys." },
  {
    code: "E005",
    role: "recruiter",
    name: "Sana Qureshi",
    title: "Talent Partner",
    does: "Moves candidates through four open roles with resume match scores.",
  },
  {
    code: "E003",
    role: "manager",
    name: "Kavya Nair",
    title: "Engineering Manager",
    does: "Has leave, attendance and expense requests waiting, plus reviews to write.",
  },
  {
    code: "E004",
    role: "employee",
    name: "Rohan Desai",
    title: "Frontend Engineer",
    does: "Clocks in, applies for leave, files expenses, reads payslips, asks the HR assistant.",
  },
];

async function loadLanding() {
  try {
    const db = await getDb();
    const today = todayIST();
    const [people, present, everyone] = await Promise.all([
      db.$count(schema.employees, ne(schema.employees.status, "exited")),
      db.$count(schema.attendance, and(eq(schema.attendance.date, today), isNotNull(schema.attendance.checkIn))),
      db
        .select({
          code: schema.employees.code,
          name: schema.employees.name,
          title: schema.employees.title,
          role: schema.employees.role,
          hue: schema.employees.hue,
        })
        .from(schema.employees)
        .where(ne(schema.employees.status, "exited"))
        .orderBy(schema.employees.name),
    ]);
    return { people, present, everyone, ok: true as const };
  } catch (err) {
    console.error("landing: database unavailable", err);
    return { people: 0, present: 0, everyone: [], ok: false as const };
  }
}

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; reset?: string }> }) {
  const [user, data, sp] = await Promise.all([getCurrentUser().catch(() => null), loadLanding(), searchParams]);
  const hueByCode = new Map(data.everyone.map((e) => [e.code, e.hue]));
  const personas = PERSONAS.map((p) => ({ ...p, hue: hueByCode.get(p.code) ?? 210 }));

  return (
    <Landing
      personas={personas}
      everyone={data.everyone}
      people={data.people}
      present={data.present}
      dbOk={data.ok}
      error={sp.error}
      reset={sp.reset === "1"}
      continueAs={user ? { name: user.name, href: "/home" } : null}
      footer={
        <p>
          A demo HRMS built by{" "}
          <Link className="link" href="https://praxel.space/">
            Prajwal DL
          </Link>
          . Northwind Labs and everyone in it are fictional; data resets every night.
        </p>
      }
    />
  );
}
