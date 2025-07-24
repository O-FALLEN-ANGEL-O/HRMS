-- 1. Create custom types (Enums) for consistent data
CREATE TYPE public.app_role AS ENUM (
    'admin',
    'employee',
    'hr',
    'manager',
    'recruiter',
    'qa-analyst',
    'process-manager',
    'team-leader',
    'marketing',
    'finance',
    'it-manager',
    'operations-manager',
    'account-manager',
    'trainer',
    'trainee'
);

CREATE TYPE public.employee_status AS ENum (
    'Active',
    'Inactive',
    'On Leave'
);

CREATE TYPE public.leave_request_status AS ENUM (
    'Pending',
    'Approved',
    'Rejected'
);

CREATE TYPE public.leave_type AS ENUM (
    'Sick Leave',
    'Casual Leave',
    'Paid Time Off',
    'Work From Home'
);


-- 2. Create Departments Table
-- Stores all company departments.
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Users Table
-- This table extends the built-in auth.users table with public-facing data.
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role app_role NOT NULL DEFAULT 'employee',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Employees (Profiles) Table
-- Stores detailed profiles for each user who is an employee.
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    employee_id TEXT UNIQUE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    phone_number TEXT,
    profile_picture_url TEXT,
    status employee_status NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create Leave Requests Table
CREATE TABLE public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL CHECK (days > 0),
    reason TEXT NOT NULL,
    status leave_request_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 6. Enable Row Level Security (RLS) for all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;


-- 7. Create RLS Policies

-- USERS Table Policies
-- Allow users to see their own user record
CREATE POLICY "Allow individual user read access" ON public.users FOR SELECT USING (auth.uid() = id);
-- Allow users to update their own record (e.g., if role change was allowed)
CREATE POLICY "Allow individual user update access" ON public.users FOR UPDATE USING (auth.uid() = id);

-- EMPLOYEES Table Policies
-- Allow users to see their own employee profile
CREATE POLICY "Allow individual employee read access" ON public.employees FOR SELECT USING (auth.uid() = user_id);
-- Allow users to update their own employee profile
CREATE POLICY "Allow individual employee update access" ON public.employees FOR UPDATE USING (auth.uid() = user_id);
-- Allow HR/Admin/Managers to see all employee profiles
CREATE POLICY "Allow HR/Admin/Manager read access to all employees" ON public.employees FOR SELECT USING (
    (get_my_claim('user_role'::text))::jsonb ?| array['admin', 'hr', 'manager']
);


-- DEPARTMENTS Table Policies
-- Allow any authenticated user to read departments
CREATE POLICY "Allow all authenticated users to read departments" ON public.departments FOR SELECT USING (auth.role() = 'authenticated');


-- LEAVE_REQUESTS Table Policies
-- Allow employees to see their own leave requests
CREATE POLICY "Allow individual read access to own leave requests" ON public.leave_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM employees WHERE employees.id = leave_requests.employee_id AND employees.user_id = auth.uid())
);
-- Allow employees to create their own leave requests
CREATE POLICY "Allow individual access to create own leave requests" ON public.leave_requests FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM employees WHERE employees.id = leave_requests.employee_id AND employees.user_id = auth.uid())
);
-- Allow HR/Admin/Managers to see all leave requests
CREATE POLICY "Allow HR/Admin/Manager read access to all leave requests" ON public.leave_requests FOR SELECT USING (
    (get_my_claim('user_role'::text))::jsonb ?| array['admin', 'hr', 'manager']
);
-- Allow HR/Admin/Managers to update status of any leave request
CREATE POLICY "Allow HR/Admin/Manager update access to all leave requests" ON public.leave_requests FOR UPDATE USING (
    (get_my_claim('user_role'::text))::jsonb ?| array['admin', 'hr', 'manager']
);

-- 8. Add a function to get a user's role from a JWT claim
-- This is useful for RLS policies.
create or replace function public.get_my_claim(claim text)
returns jsonb
language sql
stable
as $$
  select
  	coalesce(
      current_setting('request.jwt.claims', true)::jsonb ->> claim,
      null
    )::jsonb
$$;
