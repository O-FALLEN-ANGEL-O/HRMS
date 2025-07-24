
-- -----------------------------------------------------------------------------
-- -----------------------------------------------------------------------------
-- This script is designed to be idempotent. It will completely tear down and
-- rebuild the database schema, including all tables, types, functions, and
-- row-level security policies. It's safe to run multiple times.
--
-- To run this script:
-- 1. Go to your Supabase project dashboard.
-- 2. Navigate to the SQL Editor.
-- 3. Paste the entire content of this file and click "Run".
-- -----------------------------------------------------------------------------
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- 1. TEARDOWN: Drop existing objects
-- -----------------------------------------------------------------------------
-- This block ensures a clean slate by removing all known objects.
-- The order is important due to dependencies.
DO $$
BEGIN
  -- Drop functions first as they might depend on tables/types
  DROP FUNCTION IF EXISTS public.handle_new_user;

  -- Drop tables. CASCADE will handle dependent policies, constraints, etc.
  DROP TABLE IF EXISTS public.payroll_history CASCADE;
  DROP TABLE IF EXISTS public.performance_reviews CASCADE;
  DROP TABLE IF EXISTS public.helpdesk_messages CASCADE;
  DROP TABLE IF EXISTS public.helpdesk_tickets CASCADE;
  DROP TABLE IF EXISTS public.interview_notes CASCADE;
  DROP TABLE IF EXISTS public.applicants CASCADE;
  DROP TABLE IF EXISTS public.job_openings CASCADE;
  DROP TABLE IF EXISTS public.leave_requests CASCADE;
  DROP TABLE IF EXISTS public.leave_balances CASCADE;
  DROP TABLE IF EXISTS public.holidays CASCADE;
  DROP TABLE IF EXISTS public.company_feed_posts CASCADE;
  DROP TABLE IF EXISTS public.assessment_attempts CASCADE;
  DROP TABLE IF EXISTS public.assessments CASCADE;
  DROP TABLE IF EXISTS public.employees CASCADE;
  DROP TABLE IF EXISTS public.users CASCADE;
  DROP TABLE IF EXISTS public.departments CASCADE;
  DROP TABLE IF EXISTS public.bonus_points_history CASCADE;
  
  -- Drop custom types
  DROP TYPE IF EXISTS public.user_role CASCADE;
  DROP TYPE IF EXISTS public.leave_type CASCADE;
  DROP TYPE IF EXISTS public.leave_status CASCADE;
  DROP TYPE IF EXISTS public.applicant_status CASCADE;
  DROP TYPE IF EXISTS public.job_status CASCADE;
  DROP TYPE IF EXISTS public.ticket_priority CASCADE;
  DROP TYPE IF EXISTS public.ticket_status CASCADE;
  DROP TYPE IF EXISTS public.ticket_category CASCADE;
  DROP TYPE IF EXISTS public.performance_rating CASCADE;

EXCEPTION
  WHEN UNDEFINED_FUNCTION THEN -- Ignore if function doesn't exist
  WHEN UNDEFINED_TABLE THEN -- Ignore if table doesn't exist
  WHEN UNDEFINED_OBJECT THEN -- Ignore if type doesn't exist
END $$;


-- -----------------------------------------------------------------------------
-- 2. CREATE CUSTOM TYPES (ENUMS)
-- -----------------------------------------------------------------------------
-- Using enums for fixed sets of values improves data integrity.

CREATE TYPE public.user_role AS ENUM (
  'admin', 'hr', 'manager', 'recruiter', 'employee', 'trainer',
  'qa-analyst', 'process-manager', 'team-leader', 'marketing',
  'finance', 'it-manager', 'operations-manager', 'account-manager', 'trainee'
);

CREATE TYPE public.leave_type AS ENUM (
  'Sick Leave', 'Casual Leave', 'Paid Time Off', 'Work From Home'
);

CREATE TYPE public.leave_status AS ENUM (
  'Pending', 'Approved', 'Rejected'
);

CREATE TYPE public.job_status AS ENUM (
  'Open', 'Closed', 'On Hold'
);

CREATE TYPE public.applicant_status AS ENUM (
  'Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'
);

CREATE TYPE public.ticket_status AS ENUM (
  'Open', 'In Progress', 'Closed'
);

CREATE TYPE public.ticket_priority AS ENUM (
  'Low', 'Medium', 'High'
);

CREATE TYPE public.ticket_category AS ENUM (
  'IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry'
);

CREATE TYPE public.performance_rating AS ENUM (
  'Exceeds Expectations', 'Meets Expectations', 'Needs Improvement'
);


-- -----------------------------------------------------------------------------
-- 3. CREATE TABLES
-- -----------------------------------------------------------------------------

-- Departments Table
CREATE TABLE public.departments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users Table (linked to auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role public.user_role DEFAULT 'employee',
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Employees Table
CREATE TABLE public.employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id),
  manager_id UUID REFERENCES public.employees(id),
  job_title TEXT NOT NULL,
  employee_id TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  profile_picture_url TEXT,
  status TEXT DEFAULT 'Active',
  hire_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Job Openings Table
CREATE TABLE public.job_openings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES public.departments(id),
  status public.job_status DEFAULT 'Open',
  hiring_manager_id UUID REFERENCES public.employees(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Applicants Table
CREATE TABLE public.applicants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_opening_id UUID REFERENCES public.job_openings(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  status public.applicant_status DEFAULT 'Applied',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Interview Notes Table
CREATE TABLE public.interview_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_id UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES public.employees(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leave Balances Table
CREATE TABLE public.leave_balances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL UNIQUE REFERENCES public.employees(id) ON DELETE CASCADE,
  sick_leave INT DEFAULT 7,
  casual_leave INT DEFAULT 12,
  paid_time_off INT DEFAULT 20
);

-- Holidays Table
CREATE TABLE public.holidays (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL
);

-- Leave Requests Table
CREATE TABLE public.leave_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type public.leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status public.leave_status DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Helpdesk Tickets Table
CREATE TABLE public.helpdesk_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  category public.ticket_category,
  priority public.ticket_priority,
  status public.ticket_status DEFAULT 'Open',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Helpdesk Messages Table
CREATE TABLE public.helpdesk_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.employees(id),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Company Feed Posts Table
CREATE TABLE public.company_feed_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.employees(id),
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Reviews Table
CREATE TABLE public.performance_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.employees(id),
  review_period TEXT NOT NULL,
  overall_rating public.performance_rating,
  goals_summary TEXT,
  achievements_summary TEXT,
  improvement_areas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payroll History Table
CREATE TABLE public.payroll_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  pay_period DATE NOT NULL,
  gross_salary NUMERIC(10, 2),
  deductions NUMERIC(10, 2),
  net_salary NUMERIC(10, 2),
  payslip_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assessments Table
CREATE TABLE public.assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.employees(id)
);

-- Assessment Attempts Table
CREATE TABLE public.assessment_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES public.applicants(id),
  employee_id UUID REFERENCES public.employees(id),
  score NUMERIC(5, 2),
  status TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Bonus Points History Table
CREATE TABLE public.bonus_points_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'award' or 'redeem'
    points INT NOT NULL,
    reason TEXT,
    actor_id UUID REFERENCES public.employees(id), -- who awarded/approved
    created_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 4. DATABASE FUNCTIONS
-- -----------------------------------------------------------------------------
-- Function to automatically create a user profile when a new user signs up in Supabase Auth.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'employee');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
-- Enable RLS for all tables first.
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_points_history ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- NOTE: These are basic policies. You should refine them based on your specific application logic.

-- Departments: All authenticated users can read.
CREATE POLICY "Allow read access to all authenticated users" ON public.departments FOR SELECT USING (auth.role() = 'authenticated');

-- Users: Users can see their own data. HR/Admins can see all.
CREATE POLICY "Users can see their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "HR/Admins can see all users" ON public.users FOR SELECT USING ( (SELECT role FROM public.users WHERE id = auth.uid()) IN ('hr', 'admin') );

-- Employees: Employees can see their own data. Managers/HR/Admins can see all.
CREATE POLICY "Employees can see their own profile" ON public.employees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins, HR, and managers can view all employees" ON public.employees FOR SELECT USING ( (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'hr', 'manager', 'team-leader') );

-- Leave Requests: Employees can see their own. Managers/HR/Admins can see all.
CREATE POLICY "Employees can see their own leave requests" ON public.leave_requests FOR SELECT USING ( (SELECT id FROM public.employees WHERE user_id = auth.uid()) = employee_id );
CREATE POLICY "Admins, HR, and managers can see all leave requests" ON public.leave_requests FOR SELECT USING ( (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'hr', 'manager') );

-- Helpdesk Tickets: Employees can see their own. IT/Admins can see all.
CREATE POLICY "Employees can see their own tickets" ON public.helpdesk_tickets FOR SELECT USING ( (SELECT id FROM public.employees WHERE user_id = auth.uid()) = employee_id );
CREATE POLICY "Support roles can see all tickets" ON public.helpdesk_tickets FOR SELECT USING ( (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'it-manager', 'process-manager') );


-- -----------------------------------------------------------------------------
-- 6. DATA SEEDING (Optional)
-- -----------------------------------------------------------------------------
-- This is a very basic seed to get you started. For more complex seeding,
-- it's recommended to use a separate script (like the `seed.ts` file).

-- Insert Departments
INSERT INTO public.departments (name, description) VALUES
('Engineering', 'Builds and maintains the product.'),
('Human Resources', 'Manages people and culture.'),
('Sales', 'Drives revenue.'),
('Marketing', 'Manages brand and communication.'),
('Support', 'Helps customers succeed.');

-- Note: The `handle_new_user` trigger will automatically create a corresponding
-- entry in `public.users`. Here, we just create the auth user.
-- This section can be commented out if you use a separate seeding script.
DO $$
DECLARE
    admin_user_id UUID;
    hr_user_id UUID;
    manager_user_id UUID;
BEGIN
    -- Create Admin user
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, created_at, updated_at, phone, phone_confirmed_at, email_change, email_change_token_new, email_change_token_current, email_change_confirm_status)
    VALUES (gen_random_uuid(), gen_random_uuid(), 'authenticated', 'authenticated', 'admin@optitalent.com', crypt('password', gen_salt('bf')), now(), '', now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User"}', false, now(), now(), NULL, NULL, '', '', '', 0)
    RETURNING id INTO admin_user_id;
    -- Manually insert into users and employees for the seed
    INSERT INTO public.users (id, email, role, full_name) VALUES (admin_user_id, 'admin@optitalent.com', 'admin', 'Admin User');
    INSERT INTO public.employees (user_id, department_id, job_title, employee_id) VALUES (admin_user_id, (SELECT id from departments where name='Engineering'), 'Head of Everything', 'PEP0001');

    -- Create HR user
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, created_at, updated_at, phone, phone_confirmed_at, email_change, email_change_token_new, email_change_token_current, email_change_confirm_status)
    VALUES (gen_random_uuid(), gen_random_uuid(), 'authenticated', 'authenticated', 'hr@optitalent.com', crypt('password', gen_salt('bf')), now(), '', now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"HR User"}', false, now(), now(), NULL, NULL, '', '', '', 0)
    RETURNING id INTO hr_user_id;
    INSERT INTO public.users (id, email, role, full_name) VALUES (hr_user_id, 'hr@optitalent.com', 'hr', 'HR User');
    INSERT INTO public.employees (user_id, department_id, job_title, employee_id) VALUES (hr_user_id, (SELECT id from departments where name='Human Resources'), 'HR Manager', 'PEP0002');
END $$;

-- Enable public access for select-only on most tables if desired.
-- By default, RLS is restrictive. Policies above grant specific access.
-- If you want to make tables publicly readable, you can add policies like:
-- CREATE POLICY "Public read access" ON public.holidays FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON public.company_feed_posts FOR SELECT USING (true);

-- The script ends here. You can now connect your application.
-- Go to Project Settings > API and find your Project URL and anon key.
-- Add these to your .env.local file.

