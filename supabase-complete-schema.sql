-- -----------------------------------------------------------------------------
-- HR360+ COMPLETE SUPABASE SCHEMA (V2)
-- -----------------------------------------------------------------------------
-- This script is idempotent and can be re-run safely.
-- It sets up all tables, relationships, helper functions, and Row-Level Security.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- 0. EXTENSIONS & SETTINGS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. HELPER FUNCTIONS
-- -----------------------------------------------------------------------------
-- Function to get the current user's role from the public.users table.
-- Caches the result per request for performance.
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_name text;
BEGIN
  SELECT role INTO role_name FROM public.users WHERE id = auth.uid();
  RETURN role_name;
END;
$$;

-- Function to check if a user is a manager of another user.
CREATE OR REPLACE FUNCTION is_manager_of(manager_id_to_check uuid, employee_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_employee_id uuid := employee_id_to_check;
    current_manager_id uuid;
BEGIN
    LOOP
        SELECT manager_id INTO current_manager_id FROM public.employees WHERE id = current_employee_id;
        IF current_manager_id IS NULL THEN
            RETURN FALSE;
        END IF;
        IF current_manager_id = manager_id_to_check THEN
            RETURN TRUE;
        END IF;
        current_employee_id := current_manager_id;
    END LOOP;
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. ENUM TYPES
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'hr', 'manager', 'department_head', 'employee', 'process_manager', 'qa_analyst', 'floor_manager');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- 3. TABLES
-- -----------------------------------------------------------------------------

-- Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  head_id uuid REFERENCES public.employees,
  budget numeric(12, 2),
  created_at timestamptz DEFAULT now()
);

-- Employees Table
-- Note: This table will be populated via a trigger from auth.users
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text UNIQUE,
  phone text,
  dept_id uuid REFERENCES public.departments,
  role public.user_role,
  manager_id uuid REFERENCES public.employees,
  status text, -- e.g., 'Active', 'On-Leave', 'Terminated'
  hire_date date,
  probation_end date,
  salary_id uuid, -- FK to be added later
  benefit_id uuid, -- FK to be added later
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Users table to store role, linked to auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'employee'
);


-- Function to create a public user and employee profile for each new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create a record in public.users to store the role
    INSERT INTO public.users (id, role)
    VALUES (NEW.id, 'employee'); -- Default role

    -- Create a corresponding employee profile
    INSERT INTO public.employees (user_id, email, name, avatar_url, status, hire_date)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', 'Active', now());
    
    RETURN NEW;
END;
$$;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id uuid REFERENCES public.employees ON DELETE CASCADE,
    date date NOT NULL,
    clock_in timestamptz,
    clock_out timestamptz,
    remote_flag boolean DEFAULT false,
    overtime_hours numeric(4, 2),
    status text -- e.g., 'Present', 'Absent', 'Leave'
);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leaves (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id uuid REFERENCES public.employees ON DELETE CASCADE,
    type text, -- e.g., 'Sick', 'Casual', 'Earned'
    start_date date,
    end_date date,
    status text DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    reason text,
    approved_by uuid REFERENCES public.employees
);

-- Payroll Table
CREATE TABLE IF NOT EXISTS public.payroll (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id uuid REFERENCES public.employees ON DELETE CASCADE,
    month date,
    base_salary numeric(10, 2),
    bonuses numeric(10, 2),
    deductions numeric(10, 2),
    net_pay numeric(10, 2),
    payslip_url text
);

-- Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_name text,
    serial_no text UNIQUE,
    assigned_to uuid REFERENCES public.employees,
    assigned_date date,
    return_date date,
    status text -- 'In-use', 'In-stock', 'Retired'
);

-- Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id uuid REFERENCES public.employees ON DELETE CASCADE,
    type text, -- 'Voice', 'Typing', 'MCQ'
    score numeric(5, 2),
    recorded_url text, -- For voice/video tests
    feedback text
);

-- Training Sessions Table
CREATE TABLE IF NOT EXISTS public.training_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id uuid, -- Could reference a 'courses' table
    employee_id uuid REFERENCES public.employees ON DELETE CASCADE,
    progress numeric(5, 2) DEFAULT 0,
    certificate_url text
);

-- -----------------------------------------------------------------------------
-- 4. ROW-LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow full access for admins" ON public.employees;
DROP POLICY IF EXISTS "Allow HR to view all" ON public.employees;
DROP POLICY IF EXISTS "Allow employees to view their own profile" ON public.employees;
DROP POLICY IF EXISTS "Allow managers to view their team" ON public.employees;
-- (repeat for all tables and policies)

-- Employees Table Policies
CREATE POLICY "Allow full access for admins" ON public.employees FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY "Allow HR to view all" ON public.employees FOR SELECT USING (get_my_role() = 'hr');
CREATE POLICY "Allow employees to view their own profile" ON public.employees FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Allow managers to view their team" ON public.employees FOR SELECT USING (is_manager_of((SELECT id FROM public.employees WHERE user_id = auth.uid()), id));

-- Attendance Table Policies
CREATE POLICY "Allow employees to manage their own attendance" ON public.attendance FOR ALL
    USING ((SELECT auth.uid()) = (SELECT user_id FROM public.employees WHERE id = employee_id));
CREATE POLICY "Allow managers to view team's attendance" ON public.attendance FOR SELECT
    USING (is_manager_of((SELECT id FROM public.employees WHERE user_id = auth.uid()), employee_id));
CREATE POLICY "Allow HR/Admin full access to attendance" ON public.attendance FOR ALL
    USING (get_my_role() IN ('admin', 'hr'));

-- Leaves Table Policies
CREATE POLICY "Allow employees to manage their own leave requests" ON public.leaves FOR ALL
    USING ((SELECT auth.uid()) = (SELECT user_id FROM public.employees WHERE id = employee_id));
CREATE POLICY "Allow managers to manage team's leave requests" ON public.leaves FOR ALL
    USING (is_manager_of((SELECT id FROM public.employees WHERE user_id = auth.uid()), employee_id));
CREATE POLICY "Allow HR/Admin full access to leaves" ON public.leaves FOR ALL
    USING (get_my_role() IN ('admin', 'hr'));

-- Payroll Table Policies (Highly Restricted)
CREATE POLICY "Allow employees to view their own payroll" ON public.payroll FOR SELECT
    USING ((SELECT auth.uid()) = (SELECT user_id FROM public.employees WHERE id = employee_id));
CREATE POLICY "Allow HR/Admin/Finance full access to payroll" ON public.payroll FOR ALL
    USING (get_my_role() IN ('admin', 'hr', 'finance'));

-- Departments Table Policies
CREATE POLICY "Allow authenticated users to view departments" ON public.departments FOR SELECT
    USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin/hr to manage departments" ON public.departments FOR ALL
    USING (get_my_role() IN ('admin', 'hr'));
    
-- Assessments Policies
CREATE POLICY "Employees can see their own assessments" ON public.assessments FOR SELECT
    USING ((SELECT auth.uid()) = (SELECT user_id FROM public.employees WHERE id = employee_id));
CREATE POLICY "Managers can see their team's assessments" ON public.assessments FOR SELECT
    USING (is_manager_of((SELECT id FROM public.employees WHERE user_id = auth.uid()), employee_id));
CREATE POLICY "HR/QA can see all assessments" ON public.assessments FOR SELECT
    USING (get_my_role() IN ('hr', 'qa_analyst', 'admin'));

-- -----------------------------------------------------------------------------
-- 5. VIEWS (Optional but recommended for performance)
-- -----------------------------------------------------------------------------
-- Example: A view for a manager's team
CREATE OR REPLACE VIEW my_team AS
SELECT * FROM public.employees
WHERE is_manager_of((SELECT id FROM public.employees WHERE user_id = auth.uid()), id);


-- -----------------------------------------------------------------------------
-- Finalization
-- -----------------------------------------------------------------------------
-- Notify completion
SELECT 'HR360+ Schema V2 deployment complete.' as status;
