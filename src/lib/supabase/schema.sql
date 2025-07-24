-- 1. TEARDOWN
-- This section will drop all tables, types, and functions to ensure a clean slate.
-- It is designed to be run multiple times without errors.

-- Create a function to drop all policies on a table
create or replace function drop_all_policies(table_name_param text)
returns void as $$
declare
    policy_name_var text;
begin
    for policy_name_var in (select policyname from pg_policies where tablename = table_name_param) loop
        execute 'DROP POLICY "' || policy_name_var || '" ON "' || table_name_param || '";';
    end loop;
end;
$$ language plpgsql;

-- Drop policies from all tables where RLS is enabled
-- Note: Order matters due to foreign key constraints.
select drop_all_policies('helpdesk_messages');
select drop_all_policies('payroll_history');
select drop_all_policies('performance_reviews');
select drop_all_policies('interview_notes');
select drop_all_policies('applicants');
select drop_all_policies('job_openings');
select drop_all_policies('leave_requests');
select drop_all_policies('leave_balances');
select drop_all_policies('company_feed_posts');
select drop_all_policies('employees');
select drop_all_policies('users');
select drop_all_policies('departments');
select drop_all_policies('assessments');
select drop_all_policies('assessment_attempts');
select drop_all_policies('bonus_points');

-- Drop the helper function
DROP FUNCTION IF EXISTS drop_all_policies;

-- Drop all tables. The CASCADE keyword will handle dependencies.
DROP TABLE IF EXISTS public.helpdesk_messages CASCADE;
DROP TABLE IF EXISTS public.payroll_history CASCADE;
DROP TABLE IF EXISTS public.performance_reviews CASCADE;
DROP TABLE IF EXISTS public.interview_notes CASCADE;
DROP TABLE IF EXISTS public.applicants CASCADE;
DROP TABLE IF EXISTS public.job_openings CASCADE;
DROP TABLE IF EXISTS public.leave_requests CASCADE;
DROP TABLE IF EXISTS public.leave_balances CASCADE;
DROP TABLE IF EXISTS public.company_feed_posts CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.assessment_attempts CASCADE;
DROP TABLE IF EXISTS public.bonus_points CASCADE;

-- Drop all custom types.
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.leave_type CASCADE;
DROP TYPE IF EXISTS public.leave_status CASCADE;
DROP TYPE IF EXISTS public.ticket_category CASCADE;
DROP TYPE IF EXISTS public.ticket_priority CASCADE;
DROP TYPE IF EXISTS public.ticket_status CASCADE;
DROP TYPE IF EXISTS public.applicant_status CASCADE;
DROP TYPE IF EXISTS public.performance_rating CASCADE;
DROP TYPE IF EXISTS public.employee_status CASCADE;
DROP TYPE IF EXISTS public.assessment_type CASCADE;

-- Drop the handle_new_user function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();


-- 2. SCHEMA CREATION
-- Create all custom types (enums)
CREATE TYPE public.user_role AS ENUM ('admin', 'hr', 'manager', 'recruiter', 'employee', 'trainer', 'trainee', 'qa-analyst', 'process-manager', 'team-leader', 'finance', 'it-manager', 'operations-manager');
CREATE TYPE public.leave_type AS ENUM ('Sick Leave', 'Casual Leave', 'Paid Time Off', 'Work From Home');
CREATE TYPE public.leave_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE public.ticket_category AS ENUM ('IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry');
CREATE TYPE public.ticket_priority AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE public.ticket_status AS ENUM ('Open', 'In Progress', 'Closed');
CREATE TYPE public.applicant_status AS ENUM ('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected');
CREATE TYPE public.performance_rating AS ENUM ('Exceeds Expectations', 'Meets Expectations', 'Needs Improvement');
CREATE TYPE public.employee_status AS ENUM ('Active', 'On Leave', 'Terminated');
CREATE TYPE public.assessment_type AS ENUM ('mcq', 'typing', 'audio', 'voice_input', 'video_input', 'simulation');

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'employee'::user_role,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL, -- Self-referencing manager
  job_title TEXT NOT NULL,
  employee_id TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  profile_picture_url TEXT,
  hire_date DATE NOT NULL DEFAULT now(),
  status employee_status NOT NULL DEFAULT 'Active'::employee_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create assessments table
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    assessment_type assessment_type NOT NULL,
    duration_minutes INT NOT NULL,
    passing_score INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create assessment_attempts table
CREATE TABLE public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    score INT,
    status TEXT NOT NULL, -- e.g., 'Completed', 'In Progress'
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    UNIQUE(employee_id, assessment_id)
);

-- Create bonus_points table
CREATE TABLE public.bonus_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    points INT NOT NULL,
    reason TEXT,
    awarded_by_id UUID REFERENCES public.employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create company_feed_posts table
CREATE TABLE public.company_feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create leave_balances table
CREATE TABLE public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL UNIQUE REFERENCES public.employees(id) ON DELETE CASCADE,
  sick_leave INT NOT NULL DEFAULT 7,
  casual_leave INT NOT NULL DEFAULT 12,
  paid_time_off INT NOT NULL DEFAULT 20,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create holidays table
CREATE TABLE public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL
);

-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status leave_status NOT NULL DEFAULT 'Pending'::leave_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create job_openings table
CREATE TABLE public.job_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id),
  hiring_manager_id UUID REFERENCES public.employees(id),
  status TEXT NOT NULL DEFAULT 'Open', -- e.g., Open, Closed, On Hold
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create applicants table
CREATE TABLE public.applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_opening_id UUID NOT NULL REFERENCES public.job_openings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  status applicant_status NOT NULL DEFAULT 'Applied'::applicant_status,
  application_date DATE NOT NULL DEFAULT now(),
  parsed_resume_data JSONB -- To store AI parsed resume
);

-- Create interview_notes table
CREATE TABLE public.interview_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create helpdesk_tickets table
CREATE TABLE public.helpdesk_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category ticket_category NOT NULL,
  priority ticket_priority NOT NULL,
  status ticket_status NOT NULL DEFAULT 'Open'::ticket_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create helpdesk_messages table
CREATE TABLE public.helpdesk_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.employees(id), -- Can be employee or support agent
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create performance_reviews table
CREATE TABLE public.performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.employees(id),
    review_period TEXT NOT NULL, -- e.g., "Q2 2024"
    overall_rating performance_rating NOT NULL,
    goals_summary TEXT,
    achievements_summary TEXT,
    improvement_areas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payroll_history table
CREATE TABLE public.payroll_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    pay_period DATE NOT NULL,
    gross_salary NUMERIC(10, 2) NOT NULL,
    deductions NUMERIC(10, 2) NOT NULL,
    net_salary NUMERIC(10, 2) NOT NULL,
    payslip_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. FUNCTIONS
-- Function to automatically create a user in the public.users table when a new user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'employee');
  return new;
end;
$$;

-- Trigger to call the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. ROW LEVEL SECURITY (RLS)
-- Enable RLS for all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_points ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- Users can view their own data
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);
-- Users can update their own data
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Employees can view their own record
CREATE POLICY "Employees can view their own record" ON public.employees FOR SELECT USING (auth.uid() = user_id);
-- HR/Admin can view all employee records
CREATE POLICY "HR and Admins can view all employee records" ON public.employees FOR SELECT USING (
    (get_my_claim('user_role'::text)) = '"hr"'::jsonb OR
    (get_my_claim('user_role'::text)) = '"admin"'::jsonb
);
-- Managers can view records of employees who report to them
CREATE POLICY "Managers can view their direct reports" ON public.employees FOR SELECT USING (
    manager_id = (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

-- Authenticated users can see all departments, company feed, and job openings (public info)
CREATE POLICY "Allow read access to all authenticated users" ON public.departments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.company_feed_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.job_openings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.assessments FOR SELECT USING (auth.role() = 'authenticated');

-- Employees can manage their own leave requests
CREATE POLICY "Employees can manage their own leave data" ON public.leave_requests FOR ALL USING (
    employee_id = (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

-- HR/Admin can manage all leave requests
CREATE POLICY "HR and Admins can manage all leave requests" ON public.leave_requests FOR ALL USING (
    (get_my_claim('user_role'::text)) = '"hr"'::jsonb OR
    (get_my_claim('user_role'::text)) = '"admin"'::jsonb
);

-- 5. SEED DATA (Optional but recommended for development)
INSERT INTO public.departments (name, description) VALUES
('Administration', 'Overall management and support.'),
('Engineering', 'Software development and technical innovation.'),
('Human Resources', 'Manages employee relations, recruitment, and benefits.'),
('Product', 'Manages product lifecycle and development.'),
('Design', 'Creates user interfaces and experiences.'),
('Marketing', 'Promotes the company and its products.'),
('Sales', 'Drives business growth and revenue.'),
('Operations', 'Ensures the smooth running of business processes.'),
('Finance', 'Manages financial planning and records.'),
('IT', 'Manages information technology and infrastructure.'),
('Customer Support', 'Assists customers with their inquiries and issues.'),
('Quality Assurance', 'Ensures product quality and standards.'),
('Process Excellence', 'Improves business processes and efficiency.'),
('Learning & Development', 'Provides training and development programs.'),
('Client Services', 'Manages client relationships and accounts.');

-- Note: Seeding for users and employees should be done via a script (like seed.ts)
-- that can interact with Supabase Auth to create authenticated users.
-- The handle_new_user trigger will automatically populate the 'users' and 'employees' tables.
-- Here is an example of what the script would insert, for reference:

-- Example Seed for a few holidays
INSERT INTO public.holidays (name, date) VALUES
('New Year''s Day', CONCAT(EXTRACT(YEAR FROM now()), '-01-01')),
('Memorial Day', CONCAT(EXTRACT(YEAR FROM now()), '-05-27')),
('Independence Day', CONCAT(EXTRACT(YEAR FROM now()), '-07-04')),
('Labor Day', CONCAT(EXTRACT(YEAR FROM now()), '-09-02')),
('Thanksgiving Day', CONCAT(EXTRACT(YEAR FROM now()), '-11-28')),
('Christmas Day', CONCAT(EXTRACT(YEAR FROM now()), '-12-25'));
