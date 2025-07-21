-- ----------------------------------------------------------------
--                   HR+ SUpaBASE SCHEMA
-- ----------------------------------------------------------------
-- This script defines the complete database structure for the
-- HR+ application, including tables for all modules,
-- Row-Level Security (RLS) policies, and helper functions.
-- ----------------------------------------------------------------


-- ----------------------------------------------------------------
-- 1. Helper Functions & Types
-- ----------------------------------------------------------------

-- Custom Types for Roles and Statuses
CREATE TYPE user_role AS ENUM ('admin', 'hr', 'manager', 'employee', 'recruiter', 'qa-analyst', 'process-manager', 'team-leader', 'marketing', 'finance', 'it-manager', 'operations-manager', 'guest');
CREATE TYPE leave_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Closed');
CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE ticket_category AS ENUM ('IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry');
CREATE TYPE asset_status AS ENUM ('Available', 'Assigned', 'In Repair', 'Decommissioned');
CREATE TYPE assessment_type AS ENUM ('mcq', 'typing', 'audio', 'voice_input', 'video_input');
CREATE TYPE employee_status AS ENUM ('Active', 'On Leave', 'Resigned', 'Terminated');
CREATE TYPE production_line_status AS ENUM ('Running', 'Idle', 'Maintenance', 'Down');

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
-- 2. Core Tables
-- ----------------------------------------------------------------
-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  head_id uuid, -- To be populated later, references employees.id
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role,
  job_title TEXT,
  department_id uuid REFERENCES departments(id),
  manager_id uuid REFERENCES employees(id),
  hire_date DATE,
  status employee_status DEFAULT 'Active',
  profile_picture_url TEXT,
  phone_number TEXT,
  bio TEXT,
  skills JSONB,
  linkedin_profile TEXT,
  emergency_contact JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE departments
ADD CONSTRAINT fk_department_head
FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id uuid NOT NULL REFERENCES departments(id),
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
-- 3. Module-Specific Tables
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
    department_id uuid NOT NULL REFERENCES departments(id),
    year INT NOT NULL,
    allocated_amount NUMERIC(15, 2),
    UNIQUE(department_id, year)
);

-- IT & Operations Tables
CREATE TABLE IF NOT EXISTS it_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_tag TEXT UNIQUE NOT NULL,
    asset_type TEXT, -- e.g., Laptop, Monitor
    model TEXT,
    status asset_status DEFAULT 'Available',
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

-- Performance & Awards Tables
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

CREATE TABLE IF NOT EXISTS employee_awards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    giver_id uuid NOT NULL REFERENCES employees(id),
    receiver_id uuid NOT NULL REFERENCES employees(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------
-- 4. Enable Real-time & Row-Level Security (RLS)
-- ----------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_awards ENABLE ROW LEVEL SECURITY;

-- Enable real-time on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE company_posts, helpdesk_tickets, helpdesk_messages;


-- ----------------------------------------------------------------
-- 5. RLS Policies
-- ----------------------------------------------------------------

-- Employees Table Policies
CREATE POLICY "Employees can see their own profile" ON employees FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Managers can see their team members" ON employees FOR SELECT USING (is_manager_of(auth.uid(), id));
CREATE POLICY "HR/Admins can see all profiles" ON employees FOR SELECT USING (get_my_role() IN ('admin', 'hr'));
CREATE POLICY "Employees can update their own profile" ON employees FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "HR/Admins can update all profiles" ON employees FOR UPDATE USING (get_my_role() IN ('admin', 'hr'));

-- Leave Requests Table Policies
CREATE POLICY "Employees can see own leave requests" ON leave_requests FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Managers can see team leave requests" ON leave_requests FOR SELECT USING (is_manager_of(auth.uid(), employee_id));
CREATE POLICY "HR/Admins can see all leave requests" ON leave_requests FOR SELECT USING (get_my_role() IN ('admin', 'hr'));
CREATE POLICY "Employees can create leave requests" ON leave_requests FOR INSERT WITH CHECK (employee_id = auth.uid());
CREATE POLICY "Managers can update team leave requests" ON leave_requests FOR UPDATE USING (is_manager_of(auth.uid(), employee_id));
CREATE POLICY "HR/Admins can update all leave requests" ON leave_requests FOR UPDATE USING (get_my_role() IN ('admin', 'hr'));

-- Helpdesk Tickets Table Policies
CREATE POLICY "Users see their own tickets" ON helpdesk_tickets FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Support staff see relevant tickets" ON helpdesk_tickets FOR SELECT USING (get_my_role() IN ('it-manager', 'hr'));
CREATE POLICY "Users can create tickets" ON helpdesk_tickets FOR INSERT WITH CHECK (employee_id = auth.uid());
CREATE POLICY "Support staff can update tickets" ON helpdesk_tickets FOR UPDATE USING (get_my_role() IN ('it-manager', 'hr', 'admin'));

-- General "allow read all for authenticated users" for non-sensitive data
CREATE POLICY "Authenticated users can see company posts" ON company_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can see teams" ON teams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can see team members" ON team_members FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for Assessment Tables
CREATE POLICY "HR/Recruiters can manage assessments" ON assessments FOR ALL USING (get_my_role() IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Employees can view assessments" ON assessments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "HR/Recruiters can manage assessment sections" ON assessment_sections FOR ALL USING (get_my_role() IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Employees can view assessment sections" ON assessment_sections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "HR/Recruiters can manage assessment questions" ON assessment_questions FOR ALL USING (get_my_role() IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Employees can view assessment questions" ON assessment_questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Employees can manage own attempts" ON assessment_attempts FOR ALL USING (employee_id = auth.uid()) WITH CHECK (employee_id = auth.uid());
CREATE POLICY "HR/Recruiters can view all attempts" ON assessment_attempts FOR SELECT USING (get_my_role() IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Employees can submit their own answers" ON assessment_answers FOR INSERT WITH CHECK ((SELECT employee_id FROM assessment_attempts WHERE id = attempt_id) = auth.uid());
CREATE POLICY "HR/Recruiters can view all answers" ON assessment_answers FOR SELECT USING (get_my_role() IN ('admin', 'hr', 'recruiter'));

-- Default restrictive policies
CREATE POLICY "Employees can view their own payslips" ON payslips FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Finance/HR/Admins can manage payslips" ON payslips FOR ALL USING (get_my_role() IN ('admin', 'hr', 'finance'));
CREATE POLICY "Finance/Admin can manage budgets" ON budgets FOR ALL USING (get_my_role() IN ('finance', 'admin'));
CREATE POLICY "IT/Admin can manage assets" ON it_assets FOR ALL USING (get_my_role() IN ('it-manager', 'admin'));
CREATE POLICY "Recruiters/HR/Admins can manage openings" ON job_openings FOR ALL USING (get_my_role() IN ('recruiter', 'hr', 'admin'));
CREATE POLICY "Recruiters/HR/Admins can view applicants" ON applicants FOR SELECT USING (get_my_role() IN ('recruiter', 'hr', 'admin'));
