-- Drop existing tables in reverse order of dependency to avoid foreign key constraints
drop table if exists "public"."ticket_messages";
drop table if exists "public"."tickets";
drop table if exists "public"."assessment_results";
drop table if exists "public"."assessment_questions";
drop table if exists "public"."assessment_sections";
drop table if exists "public"."assessments";
drop table if exists "public"."leave_requests";
drop table if exists "public"."leave_balances";
drop table if exists "public"."company_posts";
drop table if exists "public"."applicants";
drop table if exists "public"."job_openings";
drop table if exists "public"."employees";
drop table if exists "public"."departments";

-- Create Departments table
create table if not exists "public"."departments" (
    "id" uuid not null default gen_random_uuid(),
    "name" varchar(255) not null,
    "created_at" timestamp with time zone not null default now(),
    constraint "departments_pkey" primary key ("id"),
    constraint "departments_name_key" unique ("name")
);

-- Create Employees table
create table if not exists "public"."employees" (
    "id" uuid not null,
    "employee_id" varchar(255) not null,
    "full_name" varchar(255) not null,
    "email" varchar(255) not null,
    "phone_number" varchar(50) null,
    "job_title" varchar(255) null,
    "department_id" uuid null,
    "manager_id" uuid null,
    "hire_date" date null,
    "status" varchar(50) not null default 'Active'::character varying,
    "role" varchar(50) not null,
    "profile_picture_url" text null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "skills" jsonb,
    "emergency_contact" jsonb,
    constraint "employees_pkey" primary key ("id"),
    constraint "employees_id_fkey" foreign key ("id") references "auth"."users" ("id") on delete cascade,
    constraint "employees_department_id_fkey" foreign key ("department_id") references "public"."departments" ("id") on delete set null,
    constraint "employees_manager_id_fkey" foreign key ("manager_id") references "public"."employees" ("id") on delete set null,
    constraint "employees_email_key" unique ("email"),
    constraint "employees_employee_id_key" unique ("employee_id")
);

-- Create Job Openings table
create table if not exists "public"."job_openings" (
    "id" uuid not null default gen_random_uuid(),
    "title" varchar(255) not null,
    "department_id" uuid null,
    "status" varchar(50) not null default 'Open'::character varying,
    "description" text null,
    "created_at" timestamp with time zone not null default now(),
    "company_logo" text,
    constraint "job_openings_pkey" primary key ("id"),
    constraint "job_openings_department_id_fkey" foreign key ("department_id") references "public"."departments" ("id") on delete set null,
    constraint "job_openings_title_key" unique ("title")
);

-- Create Applicants table
create table if not exists "public"."applicants" (
    "id" uuid not null default gen_random_uuid(),
    "full_name" varchar(255) not null,
    "email" varchar(255) not null,
    "phone_number" varchar(50) null,
    "status" varchar(50) not null default 'Applied'::character varying,
    "resume_url" text null,
    "profile_picture" text,
    "job_opening_id" uuid null,
    "created_at" timestamp with time zone not null default now(),
    constraint "applicants_pkey" primary key ("id"),
    constraint "applicants_job_opening_id_fkey" foreign key ("job_opening_id") references "public"."job_openings" ("id") on delete set null
);

-- Create Company Posts table
create table if not exists "public"."company_posts" (
    "id" uuid not null default gen_random_uuid(),
    "author_id" uuid not null,
    "title" varchar(255) not null,
    "content" text not null,
    "image_url" text null,
    "created_at" timestamp with time zone not null default now(),
    constraint "company_posts_pkey" primary key ("id"),
    constraint "company_posts_author_id_fkey" foreign key ("author_id") references "public"."employees" ("id") on delete cascade
);

-- Create Leave Balances table
create table if not exists "public"."leave_balances" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid not null,
    "leave_type" varchar(50) not null,
    "balance" numeric(5,2) not null default 0,
    constraint "leave_balances_pkey" primary key ("id"),
    constraint "leave_balances_employee_id_fkey" foreign key ("employee_id") references "public"."employees" ("id") on delete cascade,
    constraint "leave_balances_employee_id_leave_type_key" unique ("employee_id", "leave_type")
);

-- Create Leave Requests table
create table if not exists "public"."leave_requests" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid not null,
    "leave_type" varchar(50) not null,
    "start_date" date not null,
    "end_date" date not null,
    "reason" text null,
    "status" varchar(50) not null default 'Pending'::character varying,
    "created_at" timestamp with time zone not null default now(),
    constraint "leave_requests_pkey" primary key ("id"),
    constraint "leave_requests_employee_id_fkey" foreign key ("employee_id") references "public"."employees" ("id") on delete cascade
);

-- Create Assessments table
create table if not exists "public"."assessments" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "process_type" text not null,
    "duration" integer not null,
    "passing_score" integer not null,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    constraint "assessments_pkey" primary key ("id"),
    constraint "assessments_created_by_fkey" foreign key (created_by) references "public"."employees"(id)
);

-- Create Assessment Sections table
create table if not exists "public"."assessment_sections" (
    "id" uuid not null default gen_random_uuid(),
    "assessment_id" uuid not null,
    "title" text not null,
    "section_type" text not null,
    "time_limit" integer not null,
    constraint "assessment_sections_pkey" primary key ("id"),
    constraint "assessment_sections_assessment_id_fkey" foreign key (assessment_id) references "public"."assessments"(id) on delete cascade
);

-- Create Assessment Questions table
create table if not exists "public"."assessment_questions" (
    "id" uuid not null default gen_random_uuid(),
    "section_id" uuid not null,
    "type" text not null,
    "question_text" text not null,
    "options" jsonb,
    "correct_answer" text,
    "typing_prompt" text,
    "created_at" timestamp with time zone not null default now(),
    constraint "assessment_questions_pkey" primary key ("id"),
    constraint "assessment_questions_section_id_fkey" foreign key (section_id) references "public"."assessment_sections"(id) on delete cascade
);

-- Create Assessment Results table
create table if not exists "public"."assessment_results" (
    "id" uuid not null default gen_random_uuid(),
    "assessment_id" uuid not null,
    "employee_id" uuid not null,
    "score" integer not null,
    "completed_at" timestamp with time zone not null default now(),
    "answers" jsonb,
    constraint "assessment_results_pkey" primary key ("id"),
    constraint "assessment_results_assessment_id_fkey" foreign key (assessment_id) references "public"."assessments"(id) on delete cascade,
    constraint "assessment_results_employee_id_fkey" foreign key (employee_id) references "public"."employees"(id) on delete cascade
);

-- Create Tickets table (for helpdesk)
create table if not exists "public"."tickets" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid not null,
    "subject" text not null,
    "description" text,
    "category" text,
    "priority" text,
    "status" text default 'Open',
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    constraint "tickets_pkey" primary key ("id"),
    constraint "tickets_employee_id_fkey" foreign key (employee_id) references "public"."employees"(id) on delete cascade
);

-- Create Ticket Messages table
create table if not exists "public"."ticket_messages" (
    "id" uuid not null default gen_random_uuid(),
    "ticket_id" uuid not null,
    "sender_id" uuid,
    "message" text not null,
    "created_at" timestamp with time zone not null default now(),
    constraint "ticket_messages_pkey" primary key ("id"),
    constraint "ticket_messages_ticket_id_fkey" foreign key (ticket_id) references "public"."tickets"(id) on delete cascade,
    constraint "ticket_messages_sender_id_fkey" foreign key (sender_id) references "public"."employees"(id) on delete set null
);

-- Create Attendance Log table
create table if not exists "public"."attendance_log" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid not null,
    "check_in_time" timestamp with time zone,
    "check_out_time" timestamp with time zone,
    "date" date not null default CURRENT_DATE,
    "status" text, -- e.g., Present, Absent, WFH
    "notes" text,
    constraint "attendance_log_pkey" primary key ("id"),
    constraint "attendance_log_employee_id_fkey" foreign key (employee_id) references "public"."employees"(id) on delete cascade
);

-- RLS Policies (Enable for all new tables)
alter table "public"."departments" enable row level security;
alter table "public"."employees" enable row level security;
alter table "public"."job_openings" enable row level security;
alter table "public"."applicants" enable row level security;
alter table "public"."company_posts" enable row level security;
alter table "public"."leave_balances" enable row level security;
alter table "public"."leave_requests" enable row level security;
alter table "public"."assessments" enable row level security;
alter table "public"."assessment_sections" enable row level security;
alter table "public"."assessment_questions" enable row level security;
alter table "public"."assessment_results" enable row level security;
alter table "public"."tickets" enable row level security;
alter table "public"."ticket_messages" enable row level security;
alter table "public"."attendance_log" enable row level security;

-- Policies for public read access
create policy "Public departments are viewable by everyone." on public.departments for select using (true);
create policy "Public job openings are viewable by everyone." on public.job_openings for select using (true);
create policy "Company posts are viewable by authenticated users." on public.company_posts for select to authenticated using (true);

-- Policies for employees to manage their own data
create policy "Individuals can view their own employee data." on public.employees for select using (auth.uid() = id);
create policy "Individuals can update their own employee data." on public.employees for update using (auth.uid() = id);
create policy "Individuals can view their own leave balances." on public.leave_balances for select using (auth.uid() = employee_id);
create policy "Individuals can manage their own leave requests." on public.leave_requests for all using (auth.uid() = employee_id);
create policy "Individuals can view their own attendance." on public.attendance_log for select using (auth.uid() = employee_id);
create policy "Individuals can manage their own tickets." on public.tickets for all using (auth.uid() = employee_id);
create policy "Individuals can manage their own ticket messages." on public.ticket_messages for all using (auth.uid() = sender_id);

-- Policies for managers to view their team's data
create policy "Managers can view their team members." on public.employees for select using (
  (get_my_claim('role'::text) = '"admin"'::jsonb) OR
  (get_my_claim('role'::text) = '"hr"'::jsonb) OR
  (manager_id = auth.uid())
);
