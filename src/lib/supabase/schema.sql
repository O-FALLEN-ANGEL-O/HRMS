-- ----------------------------------------------------------------
--                   HR+ SUpaBASE SCHEMA (Idempotent)
-- ----------------------------------------------------------------
-- This script defines the complete database structure for the
-- HR+ application. It is designed to be idempotent, meaning it can be
-- run multiple times without causing errors or data loss. It checks
-- for the existence of tables and columns before creating them.
-- ----------------------------------------------------------------


-- ----------------------------------------------------------------
-- 1. Helper Functions & Types (Create or Replace)
-- ----------------------------------------------------------------

-- Custom Types for Roles and Statuses
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'hr', 'manager', 'employee', 'recruiter', 'qa-analyst', 'process-manager', 'team-leader', 'marketing', 'finance', 'it-manager', 'operations-manager', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_status AS ENUM ('Pending', 'Approved', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_category AS ENUM ('IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE asset_status AS ENUM ('Available', 'Assigned', 'In Repair', 'Decommissioned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assessment_type AS ENUM ('mcq', 'typing', 'audio', 'voice_input', 'video_input');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE employee_status AS ENUM ('Active', 'On Leave', 'Resigned', 'Terminated', 'Inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE production_line_status AS ENUM ('Running', 'Idle', 'Maintenance', 'Down');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Helper function to get the role of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
DECLARE
  role_name user_role;
BEGIN
  SELECT COALESCE(
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()),
    'guest'
  )::user_role INTO role_name;
  RETURN role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Helper function to check if a user is a manager of another user
CREATE OR REPLACE FUNCTION is_manager_of(manager_id_check uuid, employee_id_check uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.id = employee_id_check AND e.manager_id = manager_id_check
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ----------------------------------------------------------------
-- 2. Core Tables (Create and Alter)
-- ----------------------------------------------------------------

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  job_title TEXT,
  department_id uuid REFERENCES departments(id),
  manager_id uuid REFERENCES employees(id),
  hire_date DATE,
  status employee_status DEFAULT 'Active',
  profile_picture_url TEXT,
  phone_number TEXT,
  emergency_contact JSONB,
  bio TEXT,
  skills JSONB,
  linkedin_profile TEXT,
  role user_role,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id uuid REFERENCES departments(id),
  team_lead_id uuid REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Team Members Junction Table
CREATE TABLE IF NOT EXISTS team_members (
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, employee_id)
);


-- ----------------------------------------------------------------
-- 3. Module-Specific Tables (Create and Alter)
-- ----------------------------------------------------------------

-- Company Feed Table
CREATE TABLE IF NOT EXISTS company_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES employees(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  tags JSONB,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leave Management Tables
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id),
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status leave_status DEFAULT 'Pending',
  manager_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leave_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id),
  leave_type TEXT NOT NULL,
  balance NUMERIC(4, 1) NOT NULL,
  year INT NOT NULL,
  UNIQUE(employee_id, leave_type, year)
);

-- Helpdesk Tables
CREATE TABLE IF NOT EXISTS helpdesk_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_ref TEXT UNIQUE NOT NULL,
  employee_id uuid NOT NULL REFERENCES employees(id),
  subject TEXT NOT NULL,
  description TEXT,
  category ticket_category,
  priority ticket_priority,
  status ticket_status DEFAULT 'Open',
  assigned_to_id uuid REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS helpdesk_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES helpdesk_tickets(id),
  sender_id uuid NOT NULL REFERENCES employees(id),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assessment Module Tables
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  process_type TEXT,
  duration_minutes INT,
  passing_score NUMERIC(5, 2),
  created_by_id uuid REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS assessment_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  section_type assessment_type NOT NULL,
  time_limit_minutes INT
);

CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES assessment_sections(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type assessment_type NOT NULL,
  options JSONB, -- For MCQ options
  correct_answer TEXT,
  typing_prompt TEXT -- For typing tests
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id),
  employee_id uuid NOT NULL REFERENCES employees(id),
  status TEXT DEFAULT 'in_progress', -- e.g., in_progress, completed
  score NUMERIC(5, 2),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS assessment_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES assessment_questions(id),
  answer TEXT
);


-- Recruitment & Onboarding Tables
CREATE TABLE IF NOT EXISTS job_openings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department_id uuid REFERENCES departments(id),
    status TEXT DEFAULT 'Open', -- e.g., Open, Closed
    description TEXT,
    salary_range JSONB,
    location TEXT,
    job_type TEXT,
    company_logo TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'Applied', -- e.g., Applied, Screening, Interview
  job_opening_id uuid REFERENCES job_openings(id),
  profile_picture TEXT,
  linkedin_profile TEXT,
  skills JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS walkin_registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    desired_role TEXT,
    registered_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS employee_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id),
    task_id uuid NOT NULL REFERENCES onboarding_tasks(id),
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ
);


-- Finance & Payroll Tables
CREATE TABLE IF NOT EXISTS payslips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id),
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    gross_salary NUMERIC(10, 2),
    deductions NUMERIC(10, 2),
    net_salary NUMERIC(10, 2),
    payslip_data JSONB, -- Store detailed breakdown
    generated_on DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS expense_claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id),
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    status leave_status DEFAULT 'Pending',
    approved_by_id uuid REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id uuid NOT NULL REFERENCES employees(id),
    vendor TEXT,
    description TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    status leave_status DEFAULT 'Pending',
    approved_by_id uuid REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timesheets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id),
    week_ending_date DATE NOT NULL,
    hours_worked NUMERIC(5, 2),
    status leave_status DEFAULT 'Pending',
    approved_by_id uuid REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS budgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    department TEXT NOT NULL,
    year INT NOT NULL,
    allocated_amount NUMERIC(15, 2),
    UNIQUE(department, year)
);

-- IT & Operations Tables
CREATE TABLE IF NOT EXISTS it_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_tag TEXT UNIQUE NOT NULL,
    asset_type TEXT, -- e.g., Laptop, Monitor
    model TEXT,
    status TEXT,
    purchase_date DATE,
    warranty_end_date DATE,
    image_url TEXT,
    serial_number TEXT,
    current_location TEXT
);

CREATE TABLE IF NOT EXISTS asset_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id uuid NOT NULL REFERENCES it_assets(id),
    employee_id uuid NOT NULL REFERENCES employees(id),
    assigned_date DATE DEFAULT CURRENT_DATE,
    returned_date DATE
);

CREATE TABLE IF NOT EXISTS software_licenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    total_seats INT,
    available_seats INT
);

CREATE TABLE IF NOT EXISTS access_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id uuid NOT NULL REFERENCES employees(id),
    resource_name TEXT NOT NULL,
    justification TEXT,
    status leave_status DEFAULT 'Pending',
    approved_by_id uuid REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS production_lines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status production_line_status DEFAULT 'Idle',
    current_product TEXT
);

CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    line_id uuid NOT NULL REFERENCES production_lines(id),
    description TEXT,
    scheduled_date DATE
);

-- Marketing & Performance Tables
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    budget NUMERIC(10, 2)
);

CREATE TABLE IF NOT EXISTS performance_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id),
    reviewer_id uuid NOT NULL REFERENCES employees(id),
    review_period TEXT,
    goals TEXT,
    achievements TEXT,
    areas_for_improvement TEXT,
    rating TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coaching_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    qa_analyst_id uuid NOT NULL REFERENCES employees(id),
    agent_id uuid NOT NULL REFERENCES employees(id),
    interaction_id TEXT,
    feedback TEXT,
    session_date DATE DEFAULT CURRENT_DATE
);

-- Compliance Tables
CREATE TABLE IF NOT EXISTS compliance_modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS employee_compliance_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id),
    module_id uuid NOT NULL REFERENCES compliance_modules(id),
    is_completed BOOLEAN DEFAULT false,
    completion_date DATE,
    UNIQUE(employee_id, module_id)
);


-- ----------------------------------------------------------------
-- 4. Add Columns IF NOT EXISTS (for idempotency)
-- ----------------------------------------------------------------

-- Example for a few columns, this pattern should be applied for all columns for true idempotency
-- This is often handled by migration tools, but can be done in a script like this.

ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS skills JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS linkedin_profile TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role user_role;

ALTER TABLE job_openings ADD COLUMN IF NOT EXISTS company_logo TEXT;
ALTER TABLE job_openings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE job_openings ADD COLUMN IF NOT EXISTS salary_range JSONB;
ALTER TABLE job_openings ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE job_openings ADD COLUMN IF NOT EXISTS job_type TEXT;

ALTER TABLE applicants ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS linkedin_profile TEXT;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS skills JSONB;

-- ----------------------------------------------------------------
-- 5. Enable RLS & Define Policies
-- ----------------------------------------------------------------

-- Enable RLS on all tables
DO $$
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t_name);
    END LOOP;
END;
$$;


-- Enable real-time on key tables
-- This publishes changes to subscribed clients.
DO $$
BEGIN
   ALTER PUBLICATION supabase_realtime ADD TABLE company_posts, helpdesk_tickets, helpdesk_messages;
EXCEPTION
   WHEN undefined_table THEN
       -- Do nothing if tables are not found (e.g., in a fresh setup)
   WHEN others THEN
       RAISE NOTICE 'Error adding tables to realtime, might already exist.';
END;
$$;


-- RLS Policies

-- Employees Table Policies
DROP POLICY IF EXISTS "Employees can see their own profile" ON employees;
CREATE POLICY "Employees can see their own profile" ON employees FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Managers can see their team members" ON employees;
CREATE POLICY "Managers can see their team members" ON employees FOR SELECT
  USING (is_manager_of(auth.uid(), id));

DROP POLICY IF EXISTS "HR/Admins can see all profiles" ON employees;
CREATE POLICY "HR/Admins can see all profiles" ON employees FOR SELECT
  USING (get_my_role() IN ('admin', 'hr'));

DROP POLICY IF EXISTS "Employees can update their own profile" ON employees;
CREATE POLICY "Employees can update their own profile" ON employees FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "HR/Admins can update all profiles" ON employees;
CREATE POLICY "HR/Admins can update all profiles" ON employees FOR UPDATE
  USING (get_my_role() IN ('admin', 'hr'));

-- General "allow read all for authenticated users" for non-sensitive data
DROP POLICY IF EXISTS "Authenticated users can see company posts" ON company_posts;
CREATE POLICY "Authenticated users can see company posts" ON company_posts FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can see teams" ON teams;
CREATE POLICY "Authenticated users can see teams" ON teams FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can see team members" ON team_members;
CREATE POLICY "Authenticated users can see team members" ON team_members FOR SELECT USING (auth.role() = 'authenticated');

-- Default permissive policies for all other tables for demonstration purposes.
-- In a real production environment, you would create specific, restrictive policies for each table.
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON leave_requests;
CREATE POLICY "Allow all access for authenticated users" ON leave_requests FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all access for authenticated users" ON helpdesk_tickets;
CREATE POLICY "Allow all access for authenticated users" ON helpdesk_tickets FOR ALL USING (auth.role() = 'authenticated');

-- And so on for all other tables...
-- This is a simplification for development. A production setup needs granular RLS.
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON assessments;
CREATE POLICY "Allow full access for authenticated users" ON assessments FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON assessment_sections;
CREATE POLICY "Allow full access for authenticated users" ON assessment_sections FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON assessment_questions;
CREATE POLICY "Allow full access for authenticated users" ON assessment_questions FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON assessment_attempts;
CREATE POLICY "Allow full access for authenticated users" ON assessment_attempts FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON assessment_answers;
CREATE POLICY "Allow full access for authenticated users" ON assessment_answers FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON job_openings;
CREATE POLICY "Allow full access for authenticated users" ON job_openings FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON applicants;
CREATE POLICY "Allow full access for authenticated users" ON applicants FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON payslips;
CREATE POLICY "Allow full access for authenticated users" ON payslips FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON it_assets;
CREATE POLICY "Allow full access for authenticated users" ON it_assets FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON performance_reviews;
CREATE POLICY "Allow full access for authenticated users" ON performance_reviews FOR ALL USING (auth.role() = 'authenticated');
