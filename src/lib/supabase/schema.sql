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
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS leave_status CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS ticket_priority CASCADE;
DROP TYPE IF EXISTS ticket_category CASCADE;
DROP TYPE IF EXISTS asset_status CASCADE;
DROP TYPE IF EXISTS assessment_type CASCADE;
DROP TYPE IF EXISTS employee_status CASCADE;
DROP TYPE IF EXISTS production_line_status CASCADE;

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
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

-- Employees Table (replaces public.users, links to auth.users)
-- Stores detailed employee information.
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- Defines teams within the organization.
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id uuid REFERENCES departments(id),
  team_lead_id uuid REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Team Members Junction Table
-- Links employees to teams.
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

CREATE TABLE IF NOT EXISTS interview_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES applicants(id),
  interviewer_id uuid NOT NULL REFERENCES employees(id),
  mode TEXT, -- Online, Offline
  datetime TIMESTAMPTZ,
  location TEXT,
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Finance & Payroll Tables
CREATE TABLE IF NOT EXISTS payroll_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id),
    month INT,
    year INT,
    amount NUMERIC(10, 2),
    bonuses NUMERIC(10, 2),
    deductions NUMERIC(10, 2),
    generated_on DATE DEFAULT CURRENT_DATE
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
    rating NUMERIC(3, 1),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id uuid NOT NULL REFERENCES employees(id),
  receiver_id uuid NOT NULL REFERENCES employees(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- This is a simplified version. A real system might use a cron job to populate this.
CREATE TABLE IF NOT EXISTS weekly_award_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id),
  total_awards INT,
  week_number INT,
  year INT
);


-- ----------------------------------------------------------------
-- 4. Enable Real-time & Row-Level Security (RLS)
-- ----------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_award_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_schedules ENABLE ROW LEVEL SECURITY;


-- Enable real-time on key tables
-- This publishes changes to subscribed clients.
ALTER PUBLICATION supabase_realtime ADD TABLE company_posts, helpdesk_tickets;


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
CREATE POLICY "Authenticated can see awards" ON employee_awards FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can give awards" ON employee_awards FOR INSERT WITH CHECK (giver_id = auth.uid());


-- Policies for Assessment Tables
CREATE POLICY "HR/Recruiters can manage assessments" ON assessments FOR ALL USING (get_my_role() IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Employees can view assessments" ON assessments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "HR/Recruiters can manage assessment sections" ON assessment_sections FOR ALL USING (get_my_role() IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Employees can view assessment sections" ON assessment_sections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "HR/Recruiters can manage assessment questions" ON assessment_questions FOR ALL USING (get_my_role() IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Employees can view assessment questions" ON assessment_questions FOR SELECT USING (auth.role() = 'authenticated');

-- Default restrictive policies (example for one table, apply to all sensitive tables)
CREATE POLICY "Employees can view their own payslips" ON payroll_records FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Finance/HR/Admins can manage payslips" ON payroll_records FOR ALL USING (get_my_role() IN ('admin', 'hr', 'finance'));

-- Example for an IT table:
CREATE POLICY "IT/Admin can manage assets" ON it_assets FOR ALL USING (get_my_role() IN ('it-manager', 'admin'));

-- Example for a Recruitment table:
CREATE POLICY "Recruiters/HR/Admins can manage openings and applicants" ON job_openings FOR ALL USING (get_my_role() IN ('recruiter', 'hr', 'admin'));
CREATE POLICY "Recruiters/HR/Admins can view applicants" ON applicants FOR SELECT USING (get_my_role() IN ('recruiter', 'hr', 'admin'));
CREATE POLICY "Recruiters/HR/Admins can manage interviews" ON interview_schedules FOR ALL USING (get_my_role() IN ('recruiter', 'hr', 'admin'));

-- Example for a performance table:
CREATE POLICY "Users can see own reviews" ON performance_reviews FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Managers/HR can see team reviews" ON performance_reviews FOR SELECT USING (get_my_role() IN ('admin', 'hr') OR is_manager_of(auth.uid(), employee_id));
CREATE POLICY "Managers/HR can create reviews" ON performance_reviews FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'hr') OR is_manager_of(auth.uid(), employee_id));
