/**
 * Demo data for HR+. Everything is generated relative to `today`, so the demo
 * always looks current. All people and companies here are fictional.
 *
 * `buildSeedStatements(today)` returns plain SQL, used both by
 * scripts/build-seed.ts (for `wrangler d1 execute`) and by the in-app
 * "Reset demo data" action.
 */
import { computePayslip, daysInMonth } from "../lib/payroll";
import { addDays, isWeekend, workingDays } from "../lib/utils";

type Row = Record<string, string | number | boolean | null | undefined>;

/* Deterministic PRNG so the seed is stable for a given day. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DEPARTMENTS = [
  { id: "dep_eng", name: "Engineering", hue: 222 },
  { id: "dep_prd", name: "Product & Design", hue: 280 },
  { id: "dep_ppl", name: "People", hue: 340 },
  { id: "dep_sal", name: "Sales", hue: 32 },
  { id: "dep_cs", name: "Customer Success", hue: 170 },
  { id: "dep_fin", name: "Finance & Operations", hue: 140 },
];

type Person = {
  code: string;
  name: string;
  role: "admin" | "hr" | "manager" | "employee" | "recruiter";
  title: string;
  dept: string;
  mgr: string | null;
  ctc: number;
  joinedDaysAgo: number;
  birthday: string; // MM-DD
  location?: string;
  type?: "full_time" | "contract" | "intern";
  status?: "active" | "onboarding" | "offboarding";
  skills: string;
};

export const DEMO_PEOPLE: Person[] = [
  { code: "E001", name: "Meera Iyer", role: "admin", title: "Head of Operations", dept: "dep_fin", mgr: null, ctc: 48_00_000, joinedDaysAgo: 2400, birthday: "03-12", skills: "Operations, Finance, Compliance" },
  { code: "E002", name: "Arjun Rao", role: "hr", title: "HR Business Partner", dept: "dep_ppl", mgr: "E001", ctc: 16_00_000, joinedDaysAgo: 1500, birthday: "07-22", skills: "Employee relations, Policy, Payroll" },
  { code: "E003", name: "Kavya Nair", role: "manager", title: "Engineering Manager", dept: "dep_eng", mgr: "E001", ctc: 38_00_000, joinedDaysAgo: 1900, birthday: "10-16", skills: "Team leadership, System design, Go" },
  { code: "E004", name: "Rohan Desai", role: "employee", title: "Frontend Engineer", dept: "dep_eng", mgr: "E003", ctc: 14_00_000, joinedDaysAgo: 610, birthday: "01-08", skills: "React, TypeScript, Accessibility" },
  { code: "E005", name: "Sana Qureshi", role: "recruiter", title: "Talent Partner", dept: "dep_ppl", mgr: "E002", ctc: 11_00_000, joinedDaysAgo: 720, birthday: "05-30", skills: "Sourcing, Interviewing, Employer brand" },
  { code: "E006", name: "Vikram Shetty", role: "employee", title: "Backend Engineer", dept: "dep_eng", mgr: "E003", ctc: 18_00_000, joinedDaysAgo: 980, birthday: "10-14", skills: "Go, PostgreSQL, Kafka" },
  { code: "E007", name: "Ananya Bhat", role: "employee", title: "QA Engineer", dept: "dep_eng", mgr: "E003", ctc: 9_00_000, joinedDaysAgo: 400, birthday: "12-02", skills: "Playwright, Test strategy" },
  { code: "E008", name: "Farhan Sheikh", role: "employee", title: "DevOps Engineer", dept: "dep_eng", mgr: "E003", ctc: 20_00_000, joinedDaysAgo: 1300, birthday: "04-19", skills: "Kubernetes, Terraform, AWS" },
  { code: "E009", name: "Divya Menon", role: "manager", title: "Product Manager", dept: "dep_prd", mgr: "E001", ctc: 30_00_000, joinedDaysAgo: 1100, birthday: "08-05", skills: "Discovery, Roadmapping, Analytics" },
  { code: "E010", name: "Karthik Pai", role: "employee", title: "Product Designer", dept: "dep_prd", mgr: "E009", ctc: 15_00_000, joinedDaysAgo: 860, birthday: "10-21", skills: "Figma, Design systems, Prototyping" },
  { code: "E011", name: "Ishita Kulkarni", role: "employee", title: "UX Researcher", dept: "dep_prd", mgr: "E009", ctc: 12_00_000, joinedDaysAgo: 520, birthday: "02-27", skills: "Interviews, Usability testing" },
  { code: "E012", name: "Nikhil Joshi", role: "manager", title: "Sales Lead", dept: "dep_sal", mgr: "E001", ctc: 28_00_000, joinedDaysAgo: 1600, birthday: "06-11", location: "Mumbai", skills: "Enterprise sales, Negotiation" },
  { code: "E013", name: "Priya Hegde", role: "employee", title: "Account Executive", dept: "dep_sal", mgr: "E012", ctc: 10_00_000, joinedDaysAgo: 450, birthday: "09-09", location: "Mumbai", skills: "Pipeline management, Demos" },
  { code: "E014", name: "Aditya Kamath", role: "employee", title: "Sales Development Rep", dept: "dep_sal", mgr: "E012", ctc: 6_00_000, joinedDaysAgo: 210, birthday: "11-23", location: "Mumbai", skills: "Outbound, CRM hygiene" },
  { code: "E015", name: "Lakshmi Prasad", role: "manager", title: "Customer Success Lead", dept: "dep_cs", mgr: "E001", ctc: 22_00_000, joinedDaysAgo: 1400, birthday: "03-03", skills: "Onboarding, Renewals" },
  { code: "E016", name: "Rahul Gowda", role: "employee", title: "Support Associate", dept: "dep_cs", mgr: "E015", ctc: 2_60_000, joinedDaysAgo: 160, birthday: "10-29", location: "Mangaluru", skills: "Ticketing, Kannada, Hindi" },
  { code: "E017", name: "Neha Pillai", role: "employee", title: "Implementation Specialist", dept: "dep_cs", mgr: "E015", ctc: 8_00_000, joinedDaysAgo: 690, birthday: "07-14", skills: "Integrations, SQL" },
  { code: "E018", name: "Siddharth Kini", role: "employee", title: "Finance Analyst", dept: "dep_fin", mgr: "E001", ctc: 10_00_000, joinedDaysAgo: 830, birthday: "01-25", skills: "FP&A, Excel, Tally" },
  { code: "E019", name: "Pooja Shenoy", role: "employee", title: "Payroll Specialist", dept: "dep_ppl", mgr: "E002", ctc: 8_00_000, joinedDaysAgo: 940, birthday: "05-06", skills: "Payroll, PF/ESI compliance" },
  { code: "E020", name: "Manoj Kumar", role: "employee", title: "Facilities Manager", dept: "dep_fin", mgr: "E001", ctc: 7_00_000, joinedDaysAgo: 1750, birthday: "12-18", skills: "Vendors, Workplace" },
  { code: "E021", name: "Tanvi Agarwal", role: "employee", title: "Data Analyst", dept: "dep_eng", mgr: "E003", ctc: 13_00_000, joinedDaysAgo: 300, birthday: "08-30", skills: "SQL, dbt, Metabase" },
  { code: "E022", name: "Harsh Vardhan", role: "employee", title: "Mobile Engineer", dept: "dep_eng", mgr: "E003", ctc: 16_00_000, joinedDaysAgo: 3, birthday: "02-14", status: "onboarding", skills: "Kotlin, Swift, React Native" },
  { code: "E023", name: "Zoya Khan", role: "employee", title: "Content Designer", dept: "dep_prd", mgr: "E009", ctc: 9_00_000, joinedDaysAgo: -4, birthday: "06-25", status: "onboarding", skills: "UX writing, Localization" },
  { code: "E024", name: "Gautam Reddy", role: "employee", title: "Account Executive", dept: "dep_sal", mgr: "E012", ctc: 9_50_000, joinedDaysAgo: 1020, birthday: "04-02", location: "Mumbai", status: "offboarding", skills: "Mid-market sales" },
  { code: "E025", name: "Riya Sen", role: "employee", title: "Engineering Intern", dept: "dep_eng", mgr: "E003", ctc: 3_60_000, joinedDaysAgo: 75, birthday: "09-17", type: "intern", skills: "Python, React" },
  { code: "E026", name: "Abhishek Naik", role: "employee", title: "Customer Success Manager", dept: "dep_cs", mgr: "E015", ctc: 12_00_000, joinedDaysAgo: 560, birthday: "11-05", skills: "Account health, QBRs" },
  { code: "E027", name: "Shreya Bose", role: "employee", title: "Finance Associate", dept: "dep_fin", mgr: "E018", ctc: 6_50_000, joinedDaysAgo: 260, birthday: "10-15", location: "Kolkata", skills: "AP/AR, GST" },
  { code: "E028", name: "Varun Malhotra", role: "employee", title: "Sales Engineer", dept: "dep_sal", mgr: "E012", ctc: 17_00_000, joinedDaysAgo: 700, birthday: "03-28", location: "Mumbai", skills: "Solutioning, APIs" },
];

export const DEMO_LOGINS = {
  admin: "E001",
  hr: "E002",
  manager: "E003",
  employee: "E004",
  recruiter: "E005",
} as const;

const empId = (code: string) => `emp_${code.toLowerCase()}`;

const HOLIDAYS: [string, string, boolean?][] = [
  ["2026-01-01", "New Year's Day", true],
  ["2026-01-14", "Makara Sankranti"],
  ["2026-01-26", "Republic Day"],
  ["2026-03-19", "Ugadi"],
  ["2026-05-01", "May Day"],
  ["2026-08-15", "Independence Day"],
  ["2026-09-14", "Ganesha Chaturthi"],
  ["2026-10-02", "Gandhi Jayanti"],
  ["2026-10-20", "Vijayadashami"],
  ["2026-11-01", "Kannada Rajyotsava"],
  ["2026-11-09", "Deepavali"],
  ["2026-12-25", "Christmas"],
  ["2027-01-01", "New Year's Day", true],
  ["2027-01-15", "Makara Sankranti"],
  ["2027-01-26", "Republic Day"],
  ["2027-03-08", "Ugadi"],
];

const LEAVE_TYPES = [
  { id: "lt_cl", name: "Casual leave", code: "CL", annual_quota: 12, hue: 205 },
  { id: "lt_sl", name: "Sick leave", code: "SL", annual_quota: 10, hue: 160 },
  { id: "lt_el", name: "Earned leave", code: "EL", annual_quota: 18, hue: 38 },
  { id: "lt_lop", name: "Unpaid leave", code: "LOP", annual_quota: 0, hue: 0 },
];

const POLICIES = [
  {
    title: "Leave policy",
    body: "Everyone gets 12 days of casual leave, 10 days of sick leave and 18 days of earned leave per calendar year, credited on 1 January. Casual and sick leave lapse at year end; up to 10 days of earned leave carry forward. Apply at least 3 working days ahead for planned leave; sick leave can be applied on the day. Leave longer than 3 consecutive sick days needs a doctor's note. Your manager approves leave; HR can approve if your manager is away. Unpaid leave (LOP) is deducted from salary for each day taken.",
  },
  {
    title: "Work from home and hybrid",
    body: "Teams work hybrid: at least 2 office days a week at the Bengaluru or Mumbai office, agreed with your manager. Mark attendance as Remote when working from home. Customer-facing roles follow their team's roster. Internet reimbursement of up to ₹1,000 a month is available for hybrid staff via Expenses.",
  },
  {
    title: "Expenses and reimbursements",
    body: "Submit expenses within 30 days of spending with a short description. Categories: travel, meals while travelling or with customers, internet (up to ₹1,000/month), equipment (pre-approved by your manager), learning (up to ₹25,000/year for courses, books and conferences). Your manager approves; Finance reimburses approved claims with the next payroll run.",
  },
  {
    title: "Payroll calendar",
    body: "Salaries are paid on the last working day of each month. Payroll locks on the 25th: leave, attendance corrections and expenses approved after that are processed next month. Payslips appear under Payroll once a run is finalized. PF is 12% of basic (capped at ₹15,000 basic), ESI applies when monthly gross is ₹21,000 or less, and Karnataka professional tax is ₹200/month when gross is ₹25,000 or more. TDS is estimated under the new tax regime unless you opt for the old regime.",
  },
  {
    title: "Attendance and regularization",
    body: "Clock in and out from HR+ each working day. Core hours are 11:00 to 16:00 IST. If you forget to clock in or out, raise a regularization request within 7 days; your manager approves it. Three unregularized missed days in a month may be treated as unpaid leave.",
  },
  {
    title: "Health insurance and benefits",
    body: "Group health insurance covers you, your spouse, up to two children and parents for ₹5,00,000 a year, with cashless treatment at network hospitals. Add dependants within 30 days of joining or of a life event. Benefits also include an annual health check-up, a ₹25,000 learning budget, and a wellness day off each quarter.",
  },
  {
    title: "Notice period and exits",
    body: "The notice period is 60 days for full-time employees after confirmation and 15 days during probation and for interns. Unused earned leave is encashed at full and final settlement, which is paid within 45 days of the last working day. Return company assets to Facilities before your last day.",
  },
  {
    title: "Probation and confirmation",
    body: "New full-time employees have a 6-month probation. Your manager completes a confirmation review in the final month. During probation, leave accrues normally and the notice period is 15 days.",
  },
];

function q(v: Row[keyof Row]): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

function insert(table: string, rows: Row[]): string[] {
  return rows.map((r) => {
    const cols = Object.keys(r);
    return `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map((c) => q(r[c])).join(", ")});`;
  });
}

const TABLES_IN_DELETE_ORDER = [
  "audit_log",
  "notifications",
  "policies",
  "survey_responses",
  "surveys",
  "kudos",
  "announcements",
  "ticket_comments",
  "tickets",
  "reviews",
  "key_results",
  "objectives",
  "lifecycle_tasks",
  "candidates",
  "jobs",
  "assets",
  "payslips",
  "payroll_runs",
  "salary_structures",
  "expenses",
  "regularizations",
  "attendance",
  "holidays",
  "leave_requests",
  "leave_types",
  "sessions",
  "employees",
  "departments",
];

function isoAt(date: string, hourIST: number, minute: number) {
  // IST is UTC+05:30
  const totalMin = hourIST * 60 + minute - 330;
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCMinutes(totalMin);
  return d.toISOString();
}

export function quarterLabel(date: string) {
  const m = Number(date.slice(5, 7));
  return `Q${Math.ceil(m / 3)} ${date.slice(0, 4)}`;
}

export function buildSeedStatements(today: string, opts: { includeDeletes?: boolean; now?: Date } = {}): string[] {
  const nowIso = (opts.now ?? new Date()).toISOString();
  const r = rng(Number(today.replace(/-/g, "")));
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)]!;
  const out: string[] = [];
  if (opts.includeDeletes) out.push(...TABLES_IN_DELETE_ORDER.map((t) => `DELETE FROM ${t};`));

  const created = (daysAgo: number, h = 10) => isoAt(addDays(today, -daysAgo), h, Math.floor(r() * 60));

  out.push(...insert("departments", DEPARTMENTS));

  const people = DEMO_PEOPLE.map((p, i) => {
    const joinedOn = addDays(today, -p.joinedDaysAgo);
    const first = p.name.split(" ")[0]!.toLowerCase();
    return {
      id: empId(p.code),
      code: p.code,
      name: p.name,
      email: `${first}@northwind-labs.example`,
      phone: `+91 98${String(4500_0000 + i * 137_911).slice(0, 8)}`,
      role: p.role,
      title: p.title,
      department_id: p.dept,
      manager_id: p.mgr ? empId(p.mgr) : null,
      location: p.location ?? "Bengaluru",
      employment_type: p.type ?? "full_time",
      status: p.status ?? "active",
      joined_on: joinedOn,
      exit_on: p.status === "offboarding" ? addDays(today, 10) : null,
      birthday: `1995-${p.birthday}`,
      bio: null,
      skills: p.skills,
      hue: (i * 47 + 190) % 360,
      created_at: created(Math.max(p.joinedDaysAgo, 0) + 20),
    };
  });
  out.push(...insert("employees", people));

  out.push(...insert("leave_types", LEAVE_TYPES));
  out.push(...insert("holidays", HOLIDAYS.map(([date, name, optional], i) => ({ id: `hol_${i}`, date, name, optional: !!optional }))));
  const holidayDates = HOLIDAYS.map((h) => h[0]);

  /* Leave requests */
  type LR = { emp: string; type: string; start: number; len: number; status: "pending" | "approved" | "rejected"; reason: string; createdDaysAgo: number };
  const lrs: LR[] = [
    { emp: "E004", type: "lt_el", start: 9, len: 3, status: "pending", reason: "Family function in Udupi", createdDaysAgo: 1 },
    { emp: "E004", type: "lt_sl", start: -21, len: 1, status: "approved", reason: "Fever", createdDaysAgo: 21 },
    { emp: "E006", type: "lt_cl", start: 3, len: 2, status: "pending", reason: "Moving to a new flat", createdDaysAgo: 2 },
    { emp: "E007", type: "lt_el", start: 14, len: 5, status: "pending", reason: "Trip to Coorg with family", createdDaysAgo: 0 },
    { emp: "E008", type: "lt_cl", start: 0, len: 1, status: "approved", reason: "Personal errand", createdDaysAgo: 6 },
    { emp: "E010", type: "lt_el", start: -1, len: 4, status: "approved", reason: "Wedding in Kochi", createdDaysAgo: 18 },
    { emp: "E013", type: "lt_sl", start: 0, len: 2, status: "approved", reason: "Viral fever", createdDaysAgo: 0 },
    { emp: "E017", type: "lt_cl", start: 6, len: 1, status: "pending", reason: "Bank work", createdDaysAgo: 1 },
    { emp: "E021", type: "lt_el", start: 20, len: 3, status: "pending", reason: "Diwali at home in Jaipur", createdDaysAgo: 3 },
    { emp: "E014", type: "lt_lop", start: -12, len: 2, status: "approved", reason: "Exam leave", createdDaysAgo: 25 },
    { emp: "E026", type: "lt_cl", start: -8, len: 1, status: "rejected", reason: "Personal", createdDaysAgo: 12 },
    { emp: "E011", type: "lt_el", start: -40, len: 5, status: "approved", reason: "Vacation", createdDaysAgo: 60 },
    { emp: "E006", type: "lt_sl", start: -33, len: 2, status: "approved", reason: "Dental surgery", createdDaysAgo: 34 },
  ];
  const leaveRows = lrs.map((l, i) => {
    let start = addDays(today, l.start);
    while (isWeekend(start)) start = addDays(start, 1);
    let end = start;
    let added = 1;
    while (added < l.len) {
      end = addDays(end, 1);
      if (!isWeekend(end) && !holidayDates.includes(end)) added++;
    }
    const mgr = DEMO_PEOPLE.find((p) => p.code === l.emp)!.mgr!;
    return {
      id: `lr_${i}`,
      employee_id: empId(l.emp),
      leave_type_id: l.type,
      start_date: start,
      end_date: end,
      days: workingDays(start, end, holidayDates),
      half_day: false,
      reason: l.reason,
      status: l.status,
      approver_id: l.status === "pending" ? null : empId(mgr),
      decision_note: l.status === "rejected" ? "Quarter-end renewals that day — can we move it to next week?" : null,
      decided_at: l.status === "pending" ? null : created(Math.max(l.createdDaysAgo - 1, 0), 15),
      created_at: created(l.createdDaysAgo),
    };
  });
  out.push(...insert("leave_requests", leaveRows));

  const onLeave = (code: string, date: string) =>
    leaveRows.some((l) => l.employee_id === empId(code) && l.status === "approved" && l.start_date <= date && l.end_date >= date);

  /* Attendance: last 30 days */
  let missedDay = addDays(today, -3);
  while (isWeekend(missedDay) || holidayDates.includes(missedDay)) missedDay = addDays(missedDay, -1);
  const attRows: Row[] = [];
  for (const p of DEMO_PEOPLE) {
    const joined = addDays(today, -p.joinedDaysAgo);
    for (let back = 30; back >= 0; back--) {
      const date = addDays(today, -back);
      if (date < joined || isWeekend(date) || holidayDates.includes(date) || onLeave(p.code, date)) continue;
      const isToday = back === 0;
      if (isToday && (p.code === "E004" || r() < 0.3)) continue; // demo employee clocks in themselves
      if (p.code === "E004" && date === missedDay) continue; // a missed day, regularization pending
      const inH = 9 + Math.floor(r() * 2);
      const inM = Math.floor(r() * 60);
      if (isToday && isoAt(date, inH, inM) > nowIso) continue; // nobody has clocked in yet
      const remote = r() < 0.3;
      const missingOut = !isToday && p.code === "E004" && back === 6;
      attRows.push({
        id: `att_${p.code}_${back}`,
        employee_id: empId(p.code),
        date,
        check_in: isoAt(date, inH, inM),
        check_out: isToday || missingOut ? null : isoAt(date, inH + 8 + Math.floor(r() * 2), Math.floor(r() * 60)),
        mode: remote ? "remote" : "office",
        lat: null,
        lng: null,
        note: null,
      });
    }
  }
  out.push(...insert("attendance", attRows));

  out.push(
    ...insert("regularizations", [
      { id: "reg_0", employee_id: empId("E004"), date: missedDay, check_in: isoAt(missedDay, 9, 40), check_out: isoAt(missedDay, 18, 30), reason: "Was at a client workshop in Whitefield all day and forgot to clock in.", status: "pending", approver_id: null, decided_at: null, created_at: created(2) },
      { id: "reg_1", employee_id: empId("E021"), date: addDays(today, -9), check_in: isoAt(addDays(today, -9), 10, 0), check_out: isoAt(addDays(today, -9), 19, 0), reason: "App was down when I tried to clock in.", status: "approved", approver_id: empId("E003"), decided_at: created(8), created_at: created(9) },
    ]),
  );

  /* Expenses */
  const exp = [
    { emp: "E004", cat: "internet", amt: 999, d: 5, desc: "Home broadband — September", status: "pending" },
    { emp: "E004", cat: "learning", amt: 4_200, d: 18, desc: "Frontend Masters annual plan", status: "approved" },
    { emp: "E006", cat: "travel", amt: 2_340, d: 4, desc: "Cab to and from the client office in Hebbal", status: "pending" },
    { emp: "E008", cat: "equipment", amt: 7_850, d: 9, desc: "Mechanical keyboard (pre-approved)", status: "pending" },
    { emp: "E013", cat: "meals", amt: 3_600, d: 7, desc: "Lunch with Kaveri Foods procurement team", status: "approved" },
    { emp: "E013", cat: "travel", amt: 11_480, d: 12, desc: "Flight Mumbai–Pune–Mumbai for renewal meeting", status: "reimbursed" },
    { emp: "E017", cat: "travel", amt: 1_250, d: 3, desc: "Auto and metro for on-site implementation", status: "pending" },
    { emp: "E021", cat: "learning", amt: 18_000, d: 15, desc: "dbt Coalesce virtual ticket", status: "rejected" },
    { emp: "E026", cat: "meals", amt: 2_100, d: 2, desc: "Customer QBR dinner", status: "pending" },
    { emp: "E010", cat: "internet", amt: 799, d: 20, desc: "Home broadband — August", status: "reimbursed" },
  ] as const;
  out.push(
    ...insert(
      "expenses",
      exp.map((e, i) => {
        const mgr = DEMO_PEOPLE.find((p) => p.code === e.emp)!.mgr!;
        return {
          id: `exp_${i}`,
          employee_id: empId(e.emp),
          category: e.cat,
          amount: e.amt,
          spent_on: addDays(today, -e.d),
          description: e.desc,
          status: e.status,
          approver_id: e.status === "pending" ? null : empId(mgr),
          decided_at: e.status === "pending" ? null : created(e.d - 1),
          created_at: created(e.d),
        };
      }),
    ),
  );

  /* Salary structures and past payroll */
  out.push(
    ...insert(
      "salary_structures",
      DEMO_PEOPLE.map((p) => ({ employee_id: empId(p.code), annual_ctc: p.ctc, tax_regime: "new", effective_from: addDays(today, -Math.min(p.joinedDaysAgo, 200)) })),
    ),
  );
  const thisMonth = today.slice(0, 7);
  const prevMonth = (m: string) => {
    const [y, mo] = m.split("-").map(Number) as [number, number];
    return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`;
  };
  const runs = [prevMonth(prevMonth(thisMonth)), prevMonth(thisMonth)];
  runs.forEach((month, ri) => {
    const runId = `run_${month}`;
    const finalizedOn = `${month}-${String(daysInMonth(month) - 1).padStart(2, "0")}`;
    out.push(...insert("payroll_runs", [{ id: runId, month, status: "finalized", created_by: empId("E002"), finalized_at: isoAt(finalizedOn, 17, 10), ai_review: null, created_at: isoAt(`${month}-25`, 11, 0) }]));
    out.push(
      ...insert(
        "payslips",
        DEMO_PEOPLE.filter((p) => addDays(today, -p.joinedDaysAgo) <= `${month}-01`).map((p) => {
          const unpaid = p.code === "E014" && ri === 1 ? 2 : 0;
          const slip = computePayslip({ annualCtc: p.ctc, daysInMonth: daysInMonth(month), unpaidDays: unpaid, reimbursements: p.code === "E013" && ri === 1 ? 11_480 : 0 });
          return {
            id: `ps_${month}_${p.code}`,
            run_id: runId,
            employee_id: empId(p.code),
            days_payable: slip.daysPayable,
            basic: slip.basic,
            hra: slip.hra,
            special: slip.special,
            reimbursements: slip.reimbursements,
            gross: slip.gross,
            pf: slip.pf,
            esi: slip.esi,
            pt: slip.pt,
            tds: slip.tds,
            net: slip.net,
          };
        }),
      ),
    );
  });

  /* Assets */
  const assetRows: Row[] = [];
  let tagN = 1001;
  for (const p of DEMO_PEOPLE.filter((p) => p.joinedDaysAgo > 0)) {
    const mac = p.dept === "dep_eng" || p.dept === "dep_prd";
    assetRows.push({ id: `ast_${tagN}`, tag: `NW-${tagN}`, name: mac ? "MacBook Pro 14\" M4" : "ThinkPad T14 Gen 5", category: "laptop", serial: `SN${(tagN * 7919).toString(36).toUpperCase()}`, status: p.status === "offboarding" ? "assigned" : "assigned", assigned_to: empId(p.code), assigned_on: addDays(today, -Math.min(p.joinedDaysAgo, 900)), cost: mac ? 2_09_900 : 1_24_000 });
    tagN++;
  }
  const spare: [string, "laptop" | "monitor" | "phone" | "accessory" | "furniture", string, number][] = [
    ["MacBook Pro 14\" M4", "laptop", "available", 2_09_900],
    ["ThinkPad T14 Gen 5", "laptop", "repair", 1_24_000],
    ["Dell U2724D 27\" monitor", "monitor", "available", 38_500],
    ["Dell U2724D 27\" monitor", "monitor", "assigned", 38_500],
    ["iPhone 16 (test device)", "phone", "assigned", 79_900],
    ["Pixel 9 (test device)", "phone", "available", 74_999],
    ["Logitech MX Keys combo", "accessory", "available", 13_995],
    ["Herman Miller Sayl chair", "furniture", "assigned", 62_000],
  ];
  for (const [name, category, status, cost] of spare) {
    assetRows.push({ id: `ast_${tagN}`, tag: `NW-${tagN}`, name, category, serial: `SN${(tagN * 7919).toString(36).toUpperCase()}`, status, assigned_to: status === "assigned" ? empId(pick(["E004", "E022", "E010", "E008"])) : null, assigned_on: status === "assigned" ? addDays(today, -60) : null, cost });
    tagN++;
  }
  out.push(...insert("assets", assetRows));

  /* Recruiting */
  const jobsData = [
    { id: "job_be", title: "Senior Backend Engineer", dept: "dep_eng", loc: "Bengaluru", mode: "hybrid", mgr: "E003", openings: 2, desc: "Own core services for payroll and attendance processing. You'll design APIs used by thousands of employees daily, mentor two engineers, and improve reliability.", req: "5+ years building backend services in Go, Java or TypeScript\nStrong PostgreSQL and data modelling\nExperience with queues (Kafka, SQS) and distributed systems\nComfortable owning on-call for your services\nNice to have: payroll or fintech domain experience" },
    { id: "job_pd", title: "Product Designer", dept: "dep_prd", loc: "Bengaluru", mode: "hybrid", mgr: "E009", openings: 1, desc: "Design the employee self-service experience end to end, from research through shipped UI, working closely with engineering.", req: "3+ years of product design for web or mobile apps\nA portfolio showing shipped work and your process\nDesign systems experience in Figma\nComfort running usability tests\nNice to have: B2B SaaS or HR tech" },
    { id: "job_csm", title: "Customer Success Manager", dept: "dep_cs", loc: "Mangaluru", mode: "onsite", mgr: "E015", openings: 1, desc: "Own a book of 40 mid-market customers: onboarding, adoption, renewals and expansion.", req: "3+ years in customer success or account management for SaaS\nTrack record on renewals and NRR\nExcellent written and spoken English; Kannada a plus\nComfort with data and dashboards" },
    { id: "job_ae", title: "Account Executive, Mid-market", dept: "dep_sal", loc: "Mumbai", mode: "hybrid", mgr: "E012", openings: 1, desc: "Run full-cycle sales for 200–1,000 employee companies across West India.", req: "2+ years closing B2B SaaS deals\nExperience running demos and negotiating with finance and HR buyers\nCRM discipline (HubSpot or Salesforce)\nHindi and English; Marathi a plus" },
  ];
  out.push(...insert("jobs", jobsData.map((j, i) => ({ id: j.id, title: j.title, department_id: j.dept, location: j.loc, work_mode: j.mode, description: j.desc, requirements: j.req, openings: j.openings, status: "open", hiring_manager_id: empId(j.mgr), created_at: created(40 - i * 6) }))));

  const cands: { job: string; name: string; stage: string; score: number | null; source: string; resume: string }[] = [
    { job: "job_be", name: "Aman Verma", stage: "interview", score: 86, source: "Referral", resume: "Backend engineer with 6 years at a Bengaluru fintech. Built the ledger and payout services in Go on PostgreSQL, moved settlement jobs to Kafka, cut p99 latency by 40%. Led on-call for payments. Mentored three engineers. B.Tech, NIT Surathkal." },
    { job: "job_be", name: "Sneha Rajan", stage: "screening", score: 74, source: "LinkedIn", resume: "5 years Java/Spring Boot at an e-commerce company. Designed order and inventory APIs, MySQL and Redis, some Kafka. Interested in moving to Go. Mentors interns. B.E., PES University." },
    { job: "job_be", name: "Mohit Sharma", stage: "applied", score: null, source: "Careers page", resume: "Full-stack developer, 3 years. Node.js, Express, MongoDB, React. Built internal admin tools and a reporting dashboard. Some AWS Lambda. Looking for a backend-focused role." },
    { job: "job_be", name: "Fathima Rizwan", stage: "offer", score: 91, source: "Referral", resume: "Staff engineer, 8 years. TypeScript and Go services on PostgreSQL at a payroll SaaS company: salary computation engine, statutory reports for PF/ESI, multi-tenant data model. Ran incident reviews and owned SLOs. Speaker at GopherCon India." },
    { job: "job_be", name: "Chetan Patil", stage: "rejected", score: 41, source: "Agency", resume: "4 years of PHP/Laravel for agency projects. MySQL, jQuery. Some Docker. Freelance WordPress work." },
    { job: "job_pd", name: "Ira Mukherjee", stage: "interview", score: 82, source: "Dribbble", resume: "Product designer, 4 years at a B2B SaaS startup. Led the redesign of an expense app; set up the Figma design system and ran weekly usability tests. Portfolio includes shipped mobile and web flows." },
    { job: "job_pd", name: "Kunal Sethi", stage: "screening", score: null, source: "Careers page", resume: "Visual designer with 5 years in branding and marketing sites. Strong illustration and motion. Some app UI for a fitness startup. Learning UX research." },
    { job: "job_pd", name: "Ritika Das", stage: "applied", score: null, source: "LinkedIn", resume: "UX designer, 3 years. Designed onboarding and settings for a HR tech product used by 300 companies. Ran card sorts and interviews. Figma, FigJam, Maze. Built and maintained a component library with engineers." },
    { job: "job_csm", name: "Deepak Shetty", stage: "interview", score: 79, source: "Referral", resume: "Customer success manager, 4 years, managing 35 SMB accounts for a SaaS billing product. Ran QBRs, improved renewal rate to 92%. Fluent in Kannada, Tulu, English, Hindi. Based in Mangaluru." },
    { job: "job_csm", name: "Ayesha Banu", stage: "applied", score: null, source: "Naukri", resume: "Account manager at a telecom company for 6 years. Handled enterprise escalations and renewals. Excel and Salesforce. Relocating to Mangaluru." },
    { job: "job_ae", name: "Rakesh Iyer", stage: "screening", score: 68, source: "LinkedIn", resume: "Inside sales, 3 years at a marketing SaaS. Ran demos for HR and marketing heads, closed ₹1.2 Cr ARR last year. HubSpot power user. Hindi, English, Marathi." },
    { job: "job_ae", name: "Pallavi Joshi", stage: "hired", score: 88, source: "Referral", resume: "Account executive, 4 years selling HR and payroll software to mid-market companies in Mumbai and Pune. 130% of quota two years running. Salesforce, MEDDICC." },
  ];
  out.push(
    ...insert(
      "candidates",
      cands.map((c, i) => ({
        id: `cand_${i}`,
        job_id: c.job,
        name: c.name,
        email: `${c.name.split(" ")[0]!.toLowerCase()}.${c.name.split(" ")[1]!.toLowerCase()}@mail.example`,
        phone: null,
        source: c.source,
        resume_text: c.resume,
        stage: c.stage,
        match_score: c.score,
        match_summary:
          c.score === null
            ? null
            : JSON.stringify({
                summary: c.score >= 80 ? "Strong match on core requirements with directly relevant experience." : c.score >= 60 ? "Partial match; some key requirements need probing in interviews." : "Weak match for this role's core requirements.",
                strengths: c.resume.split(/[.,]/).slice(0, 2).map((s) => s.trim()).filter(Boolean),
                gaps: c.score >= 85 ? [] : ["Verify depth on the role's must-have skills"],
                questions: ["Walk me through a system or project you owned end to end.", "What would you change about it now?"],
                source: "rules",
              }),
        created_at: created(30 - i * 2),
      })),
    ),
  );

  /* Lifecycle */
  const onboarding = (code: string, joinOffset: number, doneCount: number) =>
    [
      ["Send welcome email and first-day plan", "hr", -5],
      ["Collect documents (PAN, Aadhaar, bank details)", "hr", -3],
      ["Prepare laptop and accounts", "admin", -1],
      ["Assign onboarding buddy", "manager", 0],
      ["Add to payroll and PF", "hr", 2],
      ["30-minute 1:1 with manager", "manager", 1],
      ["Set first-quarter goals", "manager", 14],
      ["Complete security and POSH training", "employee", 7],
    ].map(([title, owner, off], i) => ({
      id: `lt_${code}_${i}`,
      employee_id: empId(code),
      kind: "onboarding",
      title,
      owner_role: owner,
      due_on: addDays(today, joinOffset + (off as number)),
      done_at: i < doneCount ? created(1) : null,
      sort: i,
    }));
  const offboarding = (code: string) =>
    [
      ["Accept resignation and confirm last working day", "hr", -20],
      ["Knowledge transfer plan", "manager", -5],
      ["Revoke system access", "admin", 10],
      ["Collect laptop and ID card", "admin", 10],
      ["Exit interview", "hr", 8],
      ["Full and final settlement", "hr", 40],
    ].map(([title, owner, off], i) => ({
      id: `lt_${code}_x${i}`,
      employee_id: empId(code),
      kind: "offboarding",
      title,
      owner_role: owner,
      due_on: addDays(today, off as number),
      done_at: i < 1 ? created(19) : null,
      sort: i,
    }));
  out.push(...insert("lifecycle_tasks", [...onboarding("E022", -3, 5), ...onboarding("E023", 4, 1), ...offboarding("E024")]));

  /* OKRs */
  const quarter = quarterLabel(today);
  const okrs = [
    { id: "obj_1", owner: "E001", title: "Make HR+ the place every employee starts their day", krs: [["Weekly active employees", 60, 90, 78, "%"], ["Leave requests approved within 24h", 55, 90, 81, "%"], ["eNPS", 12, 30, 24, "pts"]] },
    { id: "obj_2", owner: "E003", title: "Ship a reliable payroll engine", krs: [["Payroll runs with zero manual corrections", 0, 3, 2, "runs"], ["p95 payslip generation time", 12, 3, 4.5, "s"], ["Test coverage on salary rules", 40, 90, 72, "%"]] },
    { id: "obj_3", owner: "E004", title: "Make self-service accessible to everyone", krs: [["WCAG AA issues fixed", 0, 40, 31, "issues"], ["Screens with keyboard-only flows", 10, 32, 24, "screens"]] },
    { id: "obj_4", owner: "E012", title: "Grow mid-market revenue in West India", krs: [["New ARR closed", 0, 150, 92, "₹L"], ["Qualified pipeline created", 0, 600, 510, "₹L"]] },
    { id: "obj_5", owner: "E015", title: "Keep customers longer", krs: [["Gross revenue retention", 88, 94, 91, "%"], ["Onboarding finished within 30 days", 50, 85, 70, "%"]] },
  ] as const;
  out.push(...insert("objectives", okrs.map((o) => ({ id: o.id, owner_id: empId(o.owner), title: o.title, quarter, created_at: created(30) }))));
  out.push(
    ...insert(
      "key_results",
      okrs.flatMap((o) => o.krs.map(([title, start, target, current, unit], i) => ({ id: `${o.id}_kr${i}`, objective_id: o.id, title, start, target, current, unit }))),
    ),
  );

  const half = Number(today.slice(5, 7)) <= 6 ? "H1" : "H2";
  const prevCycle = half === "H1" ? `H2 ${Number(today.slice(0, 4)) - 1}` : `H1 ${today.slice(0, 4)}`;
  const curCycle = `${half} ${today.slice(0, 4)}`;
  out.push(
    ...insert("reviews", [
      { id: "rev_0", employee_id: empId("E004"), reviewer_id: empId("E003"), cycle: prevCycle, rating: 4, strengths: "Led the accessibility audit and fixed most issues himself; great at explaining UI trade-offs.", growth: "Write design docs earlier so backend can plan.", summary: "Rohan exceeded expectations this cycle. He owned accessibility end to end and raised the bar for the frontend team. Next cycle he should take on technical design for a larger feature.", status: "submitted", created_at: created(110) },
      { id: "rev_1", employee_id: empId("E006"), reviewer_id: empId("E003"), cycle: prevCycle, rating: 3, strengths: "Dependable on-call; solid Go.", growth: "Share context more in code reviews.", summary: "Vikram met expectations, delivering the attendance service on time and keeping it stable.", status: "submitted", created_at: created(110) },
      { id: "rev_2", employee_id: empId("E004"), reviewer_id: empId("E003"), cycle: curCycle, rating: null, strengths: null, growth: null, summary: null, status: "draft", created_at: created(4) },
      { id: "rev_3", employee_id: empId("E007"), reviewer_id: empId("E003"), cycle: curCycle, rating: null, strengths: null, growth: null, summary: null, status: "draft", created_at: created(4) },
    ]),
  );

  /* Helpdesk */
  const tix = [
    { req: "E004", subject: "VPN disconnects every 20 minutes", desc: "Since the macOS update the VPN drops every 20 minutes and I have to log in again.", cat: "IT", pri: "high", status: "in_progress", asg: "E008", d: 2 },
    { req: "E016", subject: "PF number not showing on payslip", desc: "My UAN and PF account number are missing from last month's payslip.", cat: "Payroll", pri: "medium", status: "open", asg: null, d: 1 },
    { req: "E013", subject: "Need Form 16 for last year", desc: "Applying for a home loan and the bank needs Form 16 for FY 2025-26.", cat: "Payroll", pri: "medium", status: "resolved", asg: "E019", d: 9 },
    { req: "E010", subject: "AC not working on 3rd floor meeting room", desc: "The AC in Kudremukh room has been off since morning.", cat: "Facilities", pri: "low", status: "open", asg: "E020", d: 0 },
    { req: "E021", subject: "How do I add my parents to health insurance?", desc: "My parents moved in with me. How can I add them to the group policy?", cat: "HR", pri: "low", status: "open", asg: null, d: 3 },
    { req: "E007", subject: "Request access to staging database", desc: "Need read-only access to staging Postgres to debug flaky tests.", cat: "IT", pri: "medium", status: "resolved", asg: "E008", d: 6 },
  ] as const;
  out.push(
    ...insert(
      "tickets",
      tix.map((t, i) => ({ id: `tkt_${i}`, number: 1041 + i, requester_id: empId(t.req), subject: t.subject, description: t.desc, category: t.cat, priority: t.pri, status: t.status, assignee_id: t.asg ? empId(t.asg) : null, triaged_by: "rules", created_at: created(t.d, 9), updated_at: created(Math.max(t.d - 1, 0), 16) })),
    ),
  );
  out.push(
    ...insert("ticket_comments", [
      { id: "tc_0", ticket_id: "tkt_0", author_id: empId("E008"), body: "Looks like the new client profile. Can you try reinstalling from the Self Service app and tell me if it still drops?", created_at: created(1, 11) },
      { id: "tc_1", ticket_id: "tkt_0", author_id: empId("E004"), body: "Reinstalled — it lasted an hour, then dropped again.", created_at: created(1, 15) },
      { id: "tc_2", ticket_id: "tkt_2", author_id: empId("E019"), body: "Form 16 Part A and B are uploaded to your documents. Let me know if the bank needs anything else.", created_at: created(8, 12) },
      { id: "tc_3", ticket_id: "tkt_5", author_id: empId("E008"), body: "Granted read-only role `staging_ro`. Credentials are in 1Password under QA.", created_at: created(5, 10) },
    ]),
  );

  /* Engagement */
  out.push(
    ...insert("announcements", [
      { id: "ann_0", author_id: empId("E002"), title: "Deepavali: office closed, and sweets on the 6th", body: "The office is closed for Deepavali. Join us on the 6th at 4pm in the cafeteria for sweets and the rangoli contest — teams can sign up with Manoj.", pinned: true, created_at: created(2) },
      { id: "ann_1", author_id: empId("E001"), title: "Health insurance now covers parents-in-law", body: "From this month, the group policy covers parents-in-law within the same ₹5,00,000 family floater. Add dependants from your profile or ask Arjun.", pinned: false, created_at: created(6) },
      { id: "ann_2", author_id: empId("E003"), title: "Payroll engine v2 is live", body: "Last month's payroll ran on the new engine with zero manual fixes. Thanks Vikram, Farhan and Tanvi for the late nights.", pinned: false, created_at: created(11) },
      { id: "ann_3", author_id: empId("E012"), title: "Welcome Pallavi to the Mumbai sales team", body: "Pallavi joins us from an HR-tech company and will cover mid-market accounts in Pune.", pinned: false, created_at: created(15) },
    ]),
  );
  out.push(
    ...insert("kudos", [
      { id: "kd_0", from_id: empId("E003"), to_id: empId("E004"), value: "craft", message: "The keyboard navigation on the leave calendar is lovely. Customers noticed.", created_at: created(1) },
      { id: "kd_1", from_id: empId("E015"), to_id: empId("E016"), value: "customers", message: "Stayed late to walk Kaveri Foods through their first payroll in Kannada. They renewed the next day.", created_at: created(3) },
      { id: "kd_2", from_id: empId("E006"), to_id: empId("E008"), value: "ownership", message: "Fixed the 2am deploy failure before anyone even got paged.", created_at: created(4) },
      { id: "kd_3", from_id: empId("E002"), to_id: empId("E019"), value: "kindness", message: "Patiently helped three new joiners with their PF transfers this week.", created_at: created(6) },
      { id: "kd_4", from_id: empId("E009"), to_id: empId("E011"), value: "craft", message: "Research synthesis on expense claims was sharp and changed our roadmap.", created_at: created(8) },
      { id: "kd_5", from_id: empId("E012"), to_id: empId("E028"), value: "customers", message: "Built a custom integration demo overnight for the Pune prospect.", created_at: created(10) },
    ]),
  );
  out.push(
    ...insert("surveys", [
      { id: "srv_enps", title: `eNPS ${quarter}`, question: "How likely are you to recommend working here to a friend?", kind: "enps", status: "open", created_at: created(10) },
      { id: "srv_pulse", title: "Workload pulse", question: "How manageable was your workload this week?", kind: "pulse", status: "open", created_at: created(2) },
    ]),
  );
  const responders = DEMO_PEOPLE.filter((p) => !["E004", "E022", "E023"].includes(p.code));
  out.push(
    ...insert("survey_responses", [
      ...responders.slice(0, 19).map((p, i) => ({ id: `sr_e_${i}`, survey_id: "srv_enps", employee_id: empId(p.code), score: [10, 9, 9, 8, 7, 10, 9, 6, 8, 9, 10, 5, 9, 7, 8, 9, 10, 4, 9][i]!, comment: i === 7 ? "Too many meetings on Mondays." : i === 0 ? "Great team and flexible hours." : null, created_at: created(9 - (i % 9)) })),
      ...responders.slice(3, 15).map((p, i) => ({ id: `sr_p_${i}`, survey_id: "srv_pulse", employee_id: empId(p.code), score: [4, 3, 5, 2, 4, 3, 4, 5, 3, 2, 4, 4][i]!, comment: null, created_at: created(i % 2) })),
    ]),
  );

  out.push(...insert("policies", POLICIES.map((p, i) => ({ id: `pol_${i}`, title: p.title, body: p.body }))));

  out.push(
    ...insert("notifications", [
      { id: "nt_0", employee_id: empId("E003"), title: "Ananya requested 5 days of earned leave", href: "/approvals", read_at: null, created_at: created(0) },
      { id: "nt_1", employee_id: empId("E003"), title: "Rohan asked to correct attendance", href: "/approvals", read_at: null, created_at: created(2) },
      { id: "nt_2", employee_id: empId("E004"), title: "Kavya gave you kudos for craft", href: "/people/feed", read_at: null, created_at: created(1) },
      { id: "nt_3", employee_id: empId("E002"), title: "Zoya joins in 4 days — 7 onboarding tasks open", href: "/lifecycle", read_at: null, created_at: created(0) },
      { id: "nt_4", employee_id: empId("E005"), title: "Ritika Das applied for Product Designer", href: "/recruitment", read_at: null, created_at: created(1) },
      { id: "nt_5", employee_id: empId("E001"), title: `Payroll for ${thisMonth} is ready to run`, href: "/payroll", read_at: null, created_at: created(0) },
    ]),
  );

  return out;
}
