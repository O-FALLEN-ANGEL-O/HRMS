import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";

export const ROLES = ["admin", "hr", "manager", "employee", "recruiter"] as const;
export type Role = (typeof ROLES)[number];

const now = () => new Date().toISOString();
const createdAt = () => text("created_at").notNull().$defaultFn(now);

/* ---------------- People ---------------- */

export const departments = sqliteTable("departments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  hue: integer("hue").notNull().default(220),
});

export const employees = sqliteTable(
  "employees",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    role: text("role", { enum: ROLES }).notNull().default("employee"),
    title: text("title").notNull(),
    departmentId: text("department_id").references(() => departments.id),
    managerId: text("manager_id"),
    location: text("location").notNull().default("Bengaluru"),
    employmentType: text("employment_type", { enum: ["full_time", "contract", "intern"] })
      .notNull()
      .default("full_time"),
    status: text("status", { enum: ["active", "onboarding", "offboarding", "exited"] })
      .notNull()
      .default("active"),
    joinedOn: text("joined_on").notNull(),
    exitOn: text("exit_on"),
    birthday: text("birthday"),
    bio: text("bio"),
    skills: text("skills"),
    hue: integer("hue").notNull().default(200),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("employees_code_idx").on(t.code), index("employees_manager_idx").on(t.managerId)],
);

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: createdAt(),
});

/* ---------------- Time off ---------------- */

export const leaveTypes = sqliteTable("leave_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  annualQuota: real("annual_quota").notNull(),
  hue: integer("hue").notNull().default(160),
});

export const leaveRequests = sqliteTable(
  "leave_requests",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id),
    leaveTypeId: text("leave_type_id")
      .notNull()
      .references(() => leaveTypes.id),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    days: real("days").notNull(),
    halfDay: integer("half_day", { mode: "boolean" }).notNull().default(false),
    reason: text("reason").notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected", "cancelled"] })
      .notNull()
      .default("pending"),
    approverId: text("approver_id"),
    decisionNote: text("decision_note"),
    decidedAt: text("decided_at"),
    createdAt: createdAt(),
  },
  (t) => [index("leave_employee_idx").on(t.employeeId), index("leave_status_idx").on(t.status)],
);

export const holidays = sqliteTable("holidays", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  name: text("name").notNull(),
  optional: integer("optional", { mode: "boolean" }).notNull().default(false),
});

/* ---------------- Attendance ---------------- */

export const attendance = sqliteTable(
  "attendance",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id),
    date: text("date").notNull(),
    checkIn: text("check_in"),
    checkOut: text("check_out"),
    mode: text("mode", { enum: ["office", "remote", "field"] })
      .notNull()
      .default("office"),
    lat: real("lat"),
    lng: real("lng"),
    note: text("note"),
  },
  (t) => [uniqueIndex("attendance_emp_date_idx").on(t.employeeId, t.date)],
);

export const regularizations = sqliteTable("regularizations", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id),
  date: text("date").notNull(),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("pending"),
  approverId: text("approver_id"),
  decidedAt: text("decided_at"),
  createdAt: createdAt(),
});

/* ---------------- Money ---------------- */

export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id),
  category: text("category", { enum: ["travel", "meals", "internet", "equipment", "learning", "other"] }).notNull(),
  amount: integer("amount").notNull(), // whole rupees
  spentOn: text("spent_on").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected", "reimbursed"] })
    .notNull()
    .default("pending"),
  approverId: text("approver_id"),
  decidedAt: text("decided_at"),
  createdAt: createdAt(),
});

export const salaryStructures = sqliteTable("salary_structures", {
  employeeId: text("employee_id")
    .primaryKey()
    .references(() => employees.id),
  annualCtc: integer("annual_ctc").notNull(),
  taxRegime: text("tax_regime", { enum: ["new", "old"] })
    .notNull()
    .default("new"),
  effectiveFrom: text("effective_from").notNull(),
});

export const payrollRuns = sqliteTable("payroll_runs", {
  id: text("id").primaryKey(),
  month: text("month").notNull(), // YYYY-MM
  status: text("status", { enum: ["draft", "finalized"] })
    .notNull()
    .default("draft"),
  createdBy: text("created_by").notNull(),
  finalizedAt: text("finalized_at"),
  aiReview: text("ai_review"),
  createdAt: createdAt(),
});

export const payslips = sqliteTable(
  "payslips",
  {
    id: text("id").primaryKey(),
    runId: text("run_id")
      .notNull()
      .references(() => payrollRuns.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id),
    daysPayable: real("days_payable").notNull(),
    basic: integer("basic").notNull(),
    hra: integer("hra").notNull(),
    special: integer("special").notNull(),
    reimbursements: integer("reimbursements").notNull().default(0),
    gross: integer("gross").notNull(),
    pf: integer("pf").notNull(),
    esi: integer("esi").notNull(),
    pt: integer("pt").notNull(),
    tds: integer("tds").notNull(),
    net: integer("net").notNull(),
  },
  (t) => [uniqueIndex("payslip_run_emp_idx").on(t.runId, t.employeeId)],
);

/* ---------------- Assets ---------------- */

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  tag: text("tag").notNull(),
  name: text("name").notNull(),
  category: text("category", { enum: ["laptop", "monitor", "phone", "accessory", "furniture"] }).notNull(),
  serial: text("serial"),
  status: text("status", { enum: ["available", "assigned", "repair", "retired"] })
    .notNull()
    .default("available"),
  assignedTo: text("assigned_to"),
  assignedOn: text("assigned_on"),
  cost: integer("cost").notNull().default(0),
});

/* ---------------- Recruiting ---------------- */

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  departmentId: text("department_id").references(() => departments.id),
  location: text("location").notNull(),
  workMode: text("work_mode", { enum: ["onsite", "hybrid", "remote"] })
    .notNull()
    .default("hybrid"),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  openings: integer("openings").notNull().default(1),
  status: text("status", { enum: ["open", "paused", "closed"] })
    .notNull()
    .default("open"),
  hiringManagerId: text("hiring_manager_id"),
  createdAt: createdAt(),
});

export const CANDIDATE_STAGES = ["applied", "screening", "interview", "offer", "hired", "rejected"] as const;

export const candidates = sqliteTable("candidates", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  source: text("source").notNull().default("Careers page"),
  resumeText: text("resume_text").notNull(),
  stage: text("stage", { enum: CANDIDATE_STAGES }).notNull().default("applied"),
  matchScore: integer("match_score"),
  matchSummary: text("match_summary"), // JSON
  createdAt: createdAt(),
});

/* ---------------- Lifecycle ---------------- */

export const lifecycleTasks = sqliteTable("lifecycle_tasks", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["onboarding", "offboarding"] }).notNull(),
  title: text("title").notNull(),
  ownerRole: text("owner_role", { enum: ROLES }).notNull(),
  dueOn: text("due_on").notNull(),
  doneAt: text("done_at"),
  sort: integer("sort").notNull().default(0),
});

/* ---------------- Performance ---------------- */

export const objectives = sqliteTable("objectives", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => employees.id),
  title: text("title").notNull(),
  quarter: text("quarter").notNull(),
  createdAt: createdAt(),
});

export const keyResults = sqliteTable("key_results", {
  id: text("id").primaryKey(),
  objectiveId: text("objective_id")
    .notNull()
    .references(() => objectives.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  start: real("start").notNull().default(0),
  target: real("target").notNull(),
  current: real("current").notNull().default(0),
  unit: text("unit").notNull().default("%"),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id),
  reviewerId: text("reviewer_id")
    .notNull()
    .references(() => employees.id),
  cycle: text("cycle").notNull(),
  rating: integer("rating"),
  strengths: text("strengths"),
  growth: text("growth"),
  summary: text("summary"),
  status: text("status", { enum: ["draft", "submitted"] })
    .notNull()
    .default("draft"),
  createdAt: createdAt(),
});

/* ---------------- Helpdesk ---------------- */

export const tickets = sqliteTable("tickets", {
  id: text("id").primaryKey(),
  number: integer("number").notNull(),
  requesterId: text("requester_id")
    .notNull()
    .references(() => employees.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: text("category", { enum: ["IT", "HR", "Payroll", "Facilities", "General"] })
    .notNull()
    .default("General"),
  priority: text("priority", { enum: ["low", "medium", "high"] })
    .notNull()
    .default("medium"),
  status: text("status", { enum: ["open", "in_progress", "resolved"] })
    .notNull()
    .default("open"),
  assigneeId: text("assignee_id"),
  triagedBy: text("triaged_by", { enum: ["ai", "rules", "person"] }),
  createdAt: createdAt(),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const ticketComments = sqliteTable("ticket_comments", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => employees.id),
  body: text("body").notNull(),
  createdAt: createdAt(),
});

/* ---------------- Engagement ---------------- */

export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  authorId: text("author_id")
    .notNull()
    .references(() => employees.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const KUDOS_VALUES = ["ownership", "craft", "kindness", "customers"] as const;

export const kudos = sqliteTable("kudos", {
  id: text("id").primaryKey(),
  fromId: text("from_id")
    .notNull()
    .references(() => employees.id),
  toId: text("to_id")
    .notNull()
    .references(() => employees.id),
  value: text("value", { enum: KUDOS_VALUES }).notNull(),
  message: text("message").notNull(),
  createdAt: createdAt(),
});

export const surveys = sqliteTable("surveys", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  question: text("question").notNull(),
  kind: text("kind", { enum: ["enps", "pulse"] }).notNull(),
  status: text("status", { enum: ["open", "closed"] })
    .notNull()
    .default("open"),
  createdAt: createdAt(),
});

export const surveyResponses = sqliteTable(
  "survey_responses",
  {
    id: text("id").primaryKey(),
    surveyId: text("survey_id")
      .notNull()
      .references(() => surveys.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id),
    score: integer("score").notNull(),
    comment: text("comment"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("survey_once_idx").on(t.surveyId, t.employeeId)],
);

/* ---------------- Knowledge, notifications, audit ---------------- */

export const policies = sqliteTable("policies", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
});

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    href: text("href"),
    readAt: text("read_at"),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_emp_idx").on(t.employeeId)],
);

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id").notNull(),
  detail: text("detail"),
  createdAt: createdAt(),
});
