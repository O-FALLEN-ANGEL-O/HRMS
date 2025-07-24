
-- Full Database Reset Script for OptiTalent HRMS
-- This script is designed to be idempotent. It will completely
-- tear down and rebuild the database schema from scratch.

--
-- I. TEARDOWN PHASE
--
-- Step 1: Drop all tables in the public schema
-- Loop through all tables and drop them with cascade to handle dependencies.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Step 2: Drop all custom types in the public schema
-- This ensures that if we change an enum, the old type is removed first.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace) LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;

-- Step 3: Disable Row Level Security on all tables (if any policies survived)
-- This is a safety net before re-creating tables.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

--
-- II. SETUP PHASE
--
-- Step 1: Create Custom Types (Enums)
-- These enums provide type safety for specific columns.
CREATE TYPE public.user_roles AS ENUM (
    'admin', 'hr', 'manager', 'recruiter', 'employee', 'trainee', 'trainer', 
    'qa-analyst', 'process-manager', 'team-leader', 'finance', 'it-manager', 'operations-manager'
);

CREATE TYPE public.employee_status AS ENUM ('Active', 'Inactive', 'On Leave');
CREATE TYPE public.leave_type AS ENUM ('Sick Leave', 'Casual Leave', 'Paid Time Off', 'Work From Home');
CREATE TYPE public.leave_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE public.applicant_status AS ENUM ('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected');
CREATE TYPE public.assessment_status AS ENUM ('Not Started', 'In Progress', 'Completed', 'Retry Requested', 'Retry Approved');
CREATE TYPE public.helpdesk_category AS ENUM ('IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry');
CREATE TYPE public.helpdesk_priority AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE public.helpdesk_status AS ENUM ('Open', 'In Progress', 'Closed');

--
-- Step 2: Create Tables
--

-- Departments Table
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Openings Table
CREATE TABLE public.job_openings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    department_id UUID REFERENCES public.departments(id),
    status TEXT DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table (links to auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    role public.user_roles NOT NULL DEFAULT 'employee',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees Table (Profile information)
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    employee_id TEXT UNIQUE NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    manager_id UUID REFERENCES public.employees(id), -- Self-referencing for manager
    phone_number TEXT,
    profile_picture_url TEXT,
    status public.employee_status DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applicants Table (for external recruitment)
CREATE TABLE public.applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role_applied TEXT,
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status public.applicant_status DEFAULT 'Applied',
    resume_url TEXT,
    profile_picture_url TEXT
);

-- Parsed Resumes Table
CREATE TABLE public.parsed_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID REFERENCES public.applicants(id) ON DELETE CASCADE,
    score INT,
    justification TEXT,
    parsed_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interviewer Notes Table
CREATE TABLE public.interviewer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES public.employees(id),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Requests Table
CREATE TABLE public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    leave_type public.leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    reason TEXT,
    status public.leave_status DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Balances Table
CREATE TABLE public.leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    leave_type public.leave_type NOT NULL,
    balance INT NOT NULL DEFAULT 0,
    UNIQUE(employee_id, leave_type)
);

-- Company Holidays Table
CREATE TABLE public.holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date DATE NOT NULL UNIQUE
);

-- Assessments Table (The master list of all possible tests)
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    process_type TEXT,
    duration_minutes INT,
    passing_score INT,
    max_attempts INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applicant Assessments Table (Junction table for applicants and their assigned tests)
CREATE TABLE public.applicant_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES public.assessments(id),
    status public.assessment_status DEFAULT 'Not Started',
    retry_reason TEXT,
    UNIQUE(applicant_id, assessment_id)
);

-- Assessment Attempts Table
CREATE TABLE public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_assessment_id UUID NOT NULL REFERENCES public.applicant_assessments(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL,
    score INT,
    completed_at TIMESTAMPTZ
);

-- Helpdesk Tickets Table
CREATE TABLE public.helpdesk_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES public.employees(id),
    subject TEXT NOT NULL,
    description TEXT,
    category public.helpdesk_category,
    priority public.helpdesk_priority,
    status public.helpdesk_status DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helpdesk Messages Table
CREATE TABLE public.helpdesk_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.employees(id),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Feed Posts Table
CREATE TABLE public.company_feed_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.employees(id),
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bonus Points Table
CREATE TABLE public.bonus_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    points INT NOT NULL,
    reason TEXT,
    awarder_id UUID REFERENCES public.employees(id), -- Can be null for system awards
    created_at TIMESTAMPTZ DEFAULT NOW()
);


--
-- Step 3: Enable Row Level Security (RLS)
--
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parsed_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviewer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;

--
-- Step 4: Create RLS Policies
-- These are basic policies. You should refine them based on your app's specific needs.
--
-- Policy: Logged-in users can read all public data (e.g., departments, holidays).
CREATE POLICY "Allow authenticated read access" ON public.departments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON public.holidays FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON public.job_openings FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Users can view their own profile information.
CREATE POLICY "Users can view their own employee data" ON public.employees FOR SELECT USING (user_id = auth.uid());
-- Policy: HR and Admins can view all employee data.
CREATE POLICY "HR/Admins can view all employee data" ON public.employees FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'hr', 'manager', 'team-leader')));

-- Policy: Users can see their own user record.
CREATE POLICY "Users can view their own user data" ON public.users FOR SELECT USING (id = auth.uid());

-- Policy: Users can manage their own leave requests.
CREATE POLICY "Users can manage their own leave requests" ON public.leave_requests FOR ALL USING (EXISTS (SELECT 1 FROM employees WHERE employees.id = leave_requests.employee_id AND employees.user_id = auth.uid()));
-- Policy: HR/Admins can see all leave requests.
CREATE POLICY "HR/Admins can view all leave requests" ON public.leave_requests FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'hr', 'manager')));

--
-- Step 5: Create a function to handle new user creation
-- This function will be triggered when a new user signs up in Supabase Auth.
--
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'employee'); -- Default role is 'employee'
  
  INSERT INTO public.employees (user_id, full_name, job_title, employee_id, status)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'New Hire', 'EMP-' || substr(new.id::text, 1, 4), 'Active');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create a trigger to execute the function on new user signup
--
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

--
-- III. SEEDING PHASE
--
-- Step 1: Seed Departments
--
INSERT INTO public.departments (name) VALUES
('Administration'), ('Human Resources'), ('Engineering'), 
('Quality Assurance'), ('Process Excellence'), ('Customer Support'),
('Marketing'), ('Finance'), ('IT'), ('Operations'), 
('Client Services'), ('Learning & Development'), ('Product');

-- Step 2: Seed Users and Employees
--
DO $$
DECLARE
    admin_user_id UUID;
    hr_user_id UUID;
    manager_user_id UUID;
    recruiter_user_id UUID;
    employee_user_id UUID;
    trainee_user_id UUID;
    trainer_user_id UUID;
    
    eng_dept_id UUID;
    hr_dept_id UUID;
    admin_dept_id UUID;
    ld_dept_id UUID;
    
BEGIN
    -- Get Department IDs
    SELECT id INTO eng_dept_id FROM public.departments WHERE name = 'Engineering';
    SELECT id INTO hr_dept_id FROM public.departments WHERE name = 'Human Resources';
    SELECT id INTO admin_dept_id FROM public.departments WHERE name = 'Administration';
    SELECT id INTO ld_dept_id FROM public.departments WHERE name = 'Learning & Development';

    -- Create mock auth users and get their IDs
    admin_user_id := '00000000-0000-0000-0000-000000000001';
    hr_user_id := '00000000-0000-0000-0000-000000000002';
    manager_user_id := '00000000-0000-0000-0000-000000000003';
    recruiter_user_id := '00000000-0000-0000-0000-000000000004';
    employee_user_id := '00000000-0000-0000-0000-000000000012';
    trainee_user_id := '00000000-0000-0000-0000-000000000017';
    trainer_user_id := '00000000-0000-0000-0000-000000000016';
    
    -- Insert into public.users
    INSERT INTO public.users (id, email, role) VALUES
    (admin_user_id, 'admin@optitalent.com', 'admin'),
    (hr_user_id, 'hr@optitalent.com', 'hr'),
    (manager_user_id, 'manager@optitalent.com', 'manager'),
    (recruiter_user_id, 'recruiter@optitalent.com', 'recruiter'),
    (employee_user_id, 'employee@optitalent.com', 'employee'),
    (trainee_user_id, 'trainee@optitalent.com', 'trainee'),
    (trainer_user_id, 'trainer@optitalent.com', 'trainer');

    -- Insert into public.employees
    INSERT INTO public.employees (user_id, full_name, job_title, employee_id, department_id, status) VALUES
    (admin_user_id, 'Admin User', 'System Administrator', 'PEP0001', admin_dept_id, 'Active'),
    (hr_user_id, 'Jackson Lee', 'HR Manager', 'PEP0002', hr_dept_id, 'Active'),
    (manager_user_id, 'Isabella Nguyen', 'Engineering Manager', 'PEP0003', eng_dept_id, 'Active'),
    (recruiter_user_id, 'Sofia Davis', 'Talent Acquisition', 'PEP0004', hr_dept_id, 'Active'),
    (employee_user_id, 'Anika Sharma', 'Software Engineer', 'PEP0012', eng_dept_id, 'Active'),
    (trainee_user_id, 'Liam Johnson', 'Software Engineer Trainee', 'PEP0017', eng_dept_id, 'Active'),
    (trainer_user_id, 'Olivia Chen', 'Corporate Trainer', 'PEP0016', ld_dept_id, 'Active');

END $$;

-- Step 3: Seed Leave Requests for Anika Sharma
DO $$
DECLARE
    anika_employee_id UUID;
BEGIN
    SELECT id INTO anika_employee_id FROM public.employees WHERE employee_id = 'PEP0012';

    INSERT INTO public.leave_requests (employee_id, leave_type, start_date, end_date, days, reason, status) VALUES
    (anika_employee_id, 'Paid Time Off', '2024-08-05', '2024-08-07', 3, 'Family vacation', 'Approved'),
    (anika_employee_id, 'Sick Leave', '2024-08-01', '2024-08-01', 1, 'Fever', 'Approved'),
    (anika_employee_id, 'Casual Leave', '2024-08-12', '2024-08-12', 1, 'Personal appointment', 'Pending');
END $$;


-- Step 4: Seed Company Feed Posts
DO $$
DECLARE
    admin_employee_id UUID;
    hr_employee_id UUID;
    manager_employee_id UUID;
BEGIN
    SELECT id INTO admin_employee_id FROM public.employees WHERE employee_id = 'PEP0001';
    SELECT id INTO hr_employee_id FROM public.employees WHERE employee_id = 'PEP0002';
    SELECT id INTO manager_employee_id FROM public.employees WHERE employee_id = 'PEP0003';
    
    INSERT INTO public.company_feed_posts (author_id, title, content, image_url) VALUES
    (admin_employee_id, 'Announcing Our Series B Funding!', 'We are thrilled to announce that we have successfully closed our Series B funding round, raising $50 million.', 'https://placehold.co/600x400.png'),
    (hr_employee_id, 'Upcoming Holiday: Annual Company Retreat', 'Get ready for some fun! Our annual company retreat is just around the corner.', 'https://placehold.co/600x400.png'),
    (manager_employee_id, 'Tech Talk: The Future of AI in HR Tech', 'Join us next Wednesday at 3 PM for an insightful tech talk on how AI is revolutionizing the HR industry.', 'https://placehold.co/600x400.png');
END $$;

-- Step 5: Seed Applicants
INSERT INTO public.applicants (name, email, phone, role_applied, status) VALUES
('Aarav Sharma', 'aarav.sharma@example.com', '555-0101', 'Senior Frontend Developer', 'Interview'),
('Priya Patel', 'priya.patel@example.com', '555-0102', 'Product Manager', 'Applied'),
('Rohan Gupta', 'rohan.gupta@example.com', '555-0103', 'UI/UX Designer', 'Screening');

-- Step 6: Seed Holidays
INSERT INTO public.holidays (name, date) VALUES
('Thanksgiving Day', '2024-11-28'),
('Christmas Day', '2024-12-25');


-- End of Script
-- The database should now be fully set up and seeded.
