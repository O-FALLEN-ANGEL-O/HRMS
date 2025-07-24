--
-- Enums (Custom Types)
--

-- User and Auth Roles
create type public.app_role as enum ('admin', 'hr', 'manager', 'employee', 'recruiter', 'guest', 'finance', 'it-manager', 'operations-manager', 'process-manager', 'team-leader', 'trainer', 'trainee', 'qa-analyst', 'account-manager');
create type public.user_status as enum ('Active', 'Inactive', 'Pending');

-- Recruitment Status
create type public.applicant_status as enum ('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected');
create type public.job_status as enum ('Draft', 'Published', 'Archived');
create type public.offer_status as enum ('Draft', 'Sent', 'Accepted', 'Declined');

-- Onboarding Status
create type public.onboarding_status as enum ('Not Started', 'In Progress', 'Completed');
create type public.task_status as enum ('Todo', 'In Progress', 'Done');

-- Leave and Attendance
create type public.leave_type as enum ('Sick Leave', 'Casual Leave', 'Paid Time Off', 'Work From Home');
create type public.leave_status as enum ('Pending', 'Approved', 'Rejected');
create type public.attendance_type as enum ('Check-in', 'Check-out');

-- Helpdesk and Support
create type public.ticket_category as enum ('IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry');
create type public.ticket_status as enum ('Open', 'In Progress', 'Closed', 'Resolved');
create type public.ticket_priority as enum ('Low', 'Medium', 'High', 'Critical');

-- Performance
create type public.review_status as enum ('Pending', 'In Progress', 'Completed');

--
-- Tables
--

-- Department Table
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now() not null
);
comment on table public.departments is 'Stores company departments like Engineering, HR, etc.';

-- Employees Table
-- Stores profile information for each user.
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  department_id uuid references public.departments(id) on delete set null,
  full_name text,
  job_title text,
  employee_id text unique,
  phone_number text,
  profile_picture_url text,
  status user_status default 'Pending'::user_status,
  created_at timestamp with time zone default now() not null,
  manager_id uuid references public.employees(id) on delete set null
);
comment on table public.employees is 'Stores profile information for each user.';

-- Users Table
-- Stores application-specific user data, linking to auth.users and employees.
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade not null,
  email text unique not null,
  employee_id uuid references public.employees(id) on delete set null,
  role app_role default 'guest'::app_role not null,
  created_at timestamp with time zone default now() not null
);
comment on table public.users is 'Application-specific user data.';

-- Job Postings Table
create table public.job_postings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department_id uuid references public.departments(id),
  description text,
  requirements text,
  status job_status default 'Draft'::job_status not null,
  posted_by uuid references public.employees(id),
  posted_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);
comment on table public.job_postings is 'Stores job openings and their details.';

-- Applicants Table
create table public.applicants (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.job_postings(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  resume_url text,
  parsed_resume_data jsonb,
  ai_score numeric(5, 2), -- Score from 0.00 to 100.00
  status applicant_status default 'Applied'::applicant_status not null,
  applied_at timestamp with time zone default now() not null
);
comment on table public.applicants is 'Tracks candidates for job openings.';

-- Interviews Table
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid references public.applicants(id) on delete cascade,
  interviewer_id uuid references public.employees(id) on delete set null,
  scheduled_time timestamp with time zone not null,
  duration_minutes integer default 60,
  feedback text,
  score numeric(5, 2),
  created_at timestamp with time zone default now() not null
);
comment on table public.interviews is 'Schedules and stores feedback for interviews.';

-- Offers Table
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid references public.applicants(id) on delete cascade,
  job_id uuid references public.job_postings(id),
  offer_details jsonb, -- salary, start_date, etc.
  status offer_status default 'Draft'::offer_status not null,
  sent_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);
comment on table public.offers is 'Manages job offers sent to candidates.';


-- Onboarding Checklists Table
create table public.onboarding_checklists (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete cascade,
  status onboarding_status default 'Not Started'::onboarding_status not null,
  due_date date,
  created_at timestamp with time zone default now() not null
);
comment on table public.onboarding_checklists is 'Tracks the overall onboarding process for a new hire.';

-- Onboarding Tasks Table
create table public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid references public.onboarding_checklists(id) on delete cascade,
  title text not null,
  description text,
  status task_status default 'Todo'::task_status not null,
  assigned_to_dept_id uuid references public.departments(id),
  completed_at timestamp with time zone
);
comment on table public.onboarding_tasks is 'Individual tasks within an onboarding checklist.';


-- Leave Requests Table
create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete cascade,
  leave_type leave_type not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status leave_status default 'Pending'::leave_status not null,
  approved_by uuid references public.employees(id),
  created_at timestamp with time zone default now() not null
);
comment on table public.leave_requests is 'Manages employee leave requests.';

-- Attendance Records Table
create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete cascade,
  timestamp timestamp with time zone default now() not null,
  type attendance_type not null,
  location text,
  verified_by_face boolean
);
comment on table public.attendance_records is 'Logs employee check-ins and check-outs.';


-- Payroll Records Table
create table public.payroll (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete cascade,
  pay_period_start date not null,
  pay_period_end date not null,
  gross_salary numeric(10, 2) not null,
  deductions numeric(10, 2) default 0,
  net_salary numeric(10, 2) not null,
  processed_at timestamp with time zone,
  payslip_url text
);
comment on table public.payroll is 'Stores historical payroll data for each employee.';


-- Performance Reviews Table
create table public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete cascade,
  reviewer_id uuid references public.employees(id),
  review_period text not null, -- e.g., "Q3 2024"
  goals text,
  achievements text,
  areas_for_improvement text,
  overall_rating numeric(3, 1),
  status review_status default 'Pending'::review_status not null,
  completed_at timestamp with time zone
);
comment on table public.performance_reviews is 'Contains data for employee performance reviews.';


-- Helpdesk Tickets Table
create table public.helpdesk_tickets (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.employees(id) on delete cascade,
  assignee_id uuid references public.employees(id),
  subject text not null,
  description text,
  category ticket_category,
  priority ticket_priority default 'Medium'::ticket_priority,
  status ticket_status default 'Open'::ticket_status,
  created_at timestamp with time zone default now() not null,
  resolved_at timestamp with time zone
);
comment on table public.helpdesk_tickets is 'Manages support tickets from employees.';

-- Ticket Messages Table
create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.helpdesk_tickets(id) on delete cascade,
  sender_id uuid references public.employees(id),
  message text not null,
  created_at timestamp with time zone default now() not null
);
comment on table public.ticket_messages is 'Stores messages related to a helpdesk ticket.';

-- Company Feed/Announcements Table
create table public.company_feed (
    id uuid primary key default gen_random_uuid(),
    author_id uuid references public.employees(id),
    title text not null,
    content text,
    created_at timestamp with time zone default now() not null
);
comment on table public.company_feed is 'Stores company-wide announcements and posts.';

--
-- Security Policies (RLS - Row-Level Security)
--

-- Enable RLS for all tables
alter table public.departments enable row level security;
alter table public.employees enable row level security;
alter table public.users enable row level security;
alter table public.job_postings enable row level security;
alter table public.applicants enable row level security;
alter table public.interviews enable row level security;
alter table public.offers enable row level security;
alter table public.onboarding_checklists enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.leave_requests enable row level security;
alter table public.attendance_records enable row level security;
alter table public.payroll enable row level security;
alter table public.performance_reviews enable row level security;
alter table public.helpdesk_tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.company_feed enable row level security;


-- Helper function to get the role of the current user
create or replace function public.get_my_role()
returns app_role
language sql
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

-- Helper function to get the employee ID of the current user
create or replace function public.get_my_employee_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select employee_id from public.users where id = auth.uid()
$$;

-- Policies for 'employees' table
-- Users can see their own profile.
create policy "Users can view their own profile" on public.employees for select
  using (id = public.get_my_employee_id());
-- Admins and HR can see all profiles.
create policy "Admins and HR can view all profiles" on public.employees for select
  using (public.get_my_role() IN ('admin', 'hr'));
-- Users can update their own profile.
create policy "Users can update their own profile" on public.employees for update
  using (id = public.get_my_employee_id());
-- Admins and HR can update all profiles.
create policy "Admins and HR can update all profiles" on public.employees for update
  using (public.get_my_role() IN ('admin', 'hr'));


-- Policies for 'leave_requests' table
-- Employees can view their own leave requests.
create policy "Employees can view own leave requests" on public.leave_requests for select
  using (employee_id = public.get_my_employee_id());
-- Employees can create their own leave requests.
create policy "Employees can create leave requests" on public.leave_requests for insert
  with check (employee_id = public.get_my_employee_id());
-- Managers can see their team's leave requests (this requires manager_id to be set up correctly).
create policy "Managers can view team leave requests" on public.leave_requests for select
  using (employee_id in (select id from public.employees where manager_id = public.get_my_employee_id()));
-- Admins and HR can see all leave requests.
create policy "Admins and HR can manage all leave requests" on public.leave_requests for all
  using (public.get_my_role() IN ('admin', 'hr'));


-- Policies for 'helpdesk_tickets'
-- Users can manage their own tickets.
create policy "Users can manage their own helpdesk tickets" on public.helpdesk_tickets for all
  using (requester_id = public.get_my_employee_id());
-- Admins, HR, IT can see all tickets.
create policy "Support roles can view all tickets" on public.helpdesk_tickets for select
  using (public.get_my_role() IN ('admin', 'hr', 'it-manager', 'finance'));


-- Policies for 'company_feed'
-- All authenticated users can read the feed.
create policy "Authenticated users can read the company feed" on public.company_feed for select
  using (auth.role() = 'authenticated');
-- Admins and HR can post to the feed.
create policy "Admins and HR can create feed posts" on public.company_feed for insert
  with check (public.get_my_role() IN ('admin', 'hr'));

-- Add other policies as needed. By default, no one can access anything.
