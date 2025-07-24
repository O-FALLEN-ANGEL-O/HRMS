-- -----------------------------------------------------------------------------------------------
-- 1. CLEANUP SCRIPT
-- -----------------------------------------------------------------------------------------------
-- Drop all tables, types, and policies in the public schema to ensure a clean slate.

-- Disable RLS for the duration of the script
ALTER ROLE postgres SET pgaudit.log = 'none';

-- Drop policies first
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Drop all tables in the public schema
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all custom types (enums) in the public schema
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT typname FROM pg_type JOIN pg_namespace ON pg_type.typnamespace = pg_namespace.oid WHERE nspname = 'public' AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;


-- -----------------------------------------------------------------------------------------------
-- 2. TYPE DEFINITIONS (ENUMS)
-- -----------------------------------------------------------------------------------------------
-- Define custom data types for consistency across the database.

CREATE TYPE public.user_role AS ENUM (
    'admin', 'hr', 'manager', 'employee', 'recruiter', 'trainee', 
    'qa-analyst', 'process-manager', 'team-leader', 'marketing', 'finance', 
    'it-manager', 'operations-manager', 'account-manager', 'trainer', 'guest'
);

CREATE TYPE public.employment_status AS ENUM ('Active', 'Inactive', 'On Leave');
CREATE TYPE public.leave_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE public.leave_type AS ENUM ('Sick Leave', 'Casual Leave', 'Paid Time Off', 'Work From Home');
CREATE TYPE public.ticket_status AS ENUM ('Open', 'In Progress', 'Closed');
CREATE TYPE public.ticket_priority AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE public.ticket_category AS ENUM ('IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry');
CREATE TYPE public.assessment_status AS ENUM ('Not Started', 'In Progress', 'Completed', 'Retry Requested', 'Retry Approved');
CREATE TYPE public.assessment_type AS ENUM ('mcq', 'typing', 'audio', 'voice_input', 'video_input', 'simulation');


-- -----------------------------------------------------------------------------------------------
-- 3. TABLE CREATION
-- -----------------------------------------------------------------------------------------------
-- Create all tables required for the OptiTalent application.

-- Departments Table
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.departments IS 'Stores company departments.';

-- Users Table (linked to Supabase Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY, -- This MUST match auth.users.id
    email TEXT UNIQUE,
    role public.user_role NOT NULL DEFAULT 'employee',
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.users IS 'Stores user account data linked to Supabase authentication.';

-- Employees Profile Table
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    job_title TEXT,
    employee_id TEXT UNIQUE,
    phone_number TEXT,
    profile_picture_url TEXT,
    status public.employment_status DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.employees IS 'Stores detailed profile information for employees.';

-- Leave Requests Table
CREATE TABLE public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type public.leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    reason TEXT,
    status public.leave_status DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.leave_requests IS 'Tracks employee leave requests and their status.';

-- Helpdesk Tickets Table
CREATE TABLE public.helpdesk_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id_serial SERIAL,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT,
    category public.ticket_category,
    priority public.ticket_priority,
    status public.ticket_status DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.helpdesk_tickets IS 'Stores helpdesk support tickets submitted by employees.';

-- Helpdesk Messages Table
CREATE TABLE public.helpdesk_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.helpdesk_messages IS 'Stores messages for each helpdesk ticket.';

-- Company Feed Table
CREATE TABLE public.company_feed_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.company_feed_posts IS 'Stores posts for the internal company feed.';

-- Applicants Table
CREATE TABLE public.applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id_serial SERIAL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role_applied TEXT,
    status TEXT, -- e.g., 'Applied', 'Screening', 'Interview'
    application_date DATE DEFAULT now(),
    resume_url TEXT
);
COMMENT ON TABLE public.applicants IS 'Stores information about job applicants.';

-- Applicant Data (from Resume Parsing)
CREATE TABLE public.applicant_parsed_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    score INT,
    justification TEXT,
    summary TEXT,
    skills TEXT[],
    certifications TEXT[],
    languages TEXT[],
    hobbies TEXT[],
    links TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.applicant_parsed_data IS 'Stores structured data parsed from applicant resumes.';

CREATE TABLE public.applicant_work_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parsed_data_id UUID NOT NULL REFERENCES public.applicant_parsed_data(id) ON DELETE CASCADE,
    company TEXT,
    title TEXT,
    dates TEXT
);

CREATE TABLE public.applicant_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parsed_data_id UUID NOT NULL REFERENCES public.applicant_parsed_data(id) ON DELETE CASCADE,
    institution TEXT,
    degree TEXT,
    year TEXT
);

CREATE TABLE public.applicant_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parsed_data_id UUID NOT NULL REFERENCES public.applicant_parsed_data(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT,
    url TEXT
);

-- Assessments Table
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id_serial SERIAL,
    title TEXT NOT NULL,
    process_type TEXT,
    duration INT, -- in minutes
    passing_score INT,
    max_attempts INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.assessments IS 'Stores assessment templates.';

-- Assessment Attempts Table
CREATE TABLE public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id),
    applicant_id UUID REFERENCES public.applicants(id),
    employee_id UUID REFERENCES public.employees(id),
    status public.assessment_status DEFAULT 'Not Started',
    score INT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);
COMMENT ON TABLE public.assessment_attempts IS 'Tracks attempts for each assessment by applicants or employees.';

-- Performance Reviews Table
CREATE TABLE public.performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    reviewer_id UUID NOT NULL REFERENCES public.employees(id),
    review_period TEXT, -- e.g., 'Q3 2024'
    summary TEXT,
    rating TEXT, -- e.g., 'Exceeds Expectations'
    review_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.performance_reviews IS 'Stores performance review records.';

-- Payroll History Table
CREATE TABLE public.payroll_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    pay_period TEXT NOT NULL, -- e.g., 'July 2024'
    gross_salary NUMERIC(10, 2),
    net_salary NUMERIC(10, 2),
    processed_date DATE,
    payslip_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.payroll_history IS 'Stores historical payroll data for each employee.';


-- -----------------------------------------------------------------------------------------------
-- 4. ROW-LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------------------------
-- Enable RLS on all tables and set up basic policies.

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_parsed_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_history ENABLE ROW LEVEL SECURITY;

-- Policies for public read access (for demonstration)
CREATE POLICY "Allow public read access to all" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Allow public read access to all" ON public.company_feed_posts FOR SELECT USING (true);
CREATE POLICY "Allow public read access to all" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "Allow public read access to all" ON public.applicants FOR SELECT USING (true);

-- Policies for authenticated users
CREATE POLICY "Allow authenticated users to read all" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read all" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read all" ON public.leave_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read all" ON public.helpdesk_tickets FOR SELECT TO authenticated USING (true);

-- Policies for users to manage their own data
CREATE POLICY "Users can insert their own profile" ON public.employees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.employees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own leave requests" ON public.leave_requests FOR ALL USING ( (SELECT auth.uid() FROM employees WHERE id = employee_id) = auth.uid() );
CREATE POLICY "Users can manage their own helpdesk tickets" ON public.helpdesk_tickets FOR ALL USING ( (SELECT auth.uid() FROM employees WHERE id = employee_id) = auth.uid() );
CREATE POLICY "Users can manage their own payroll history" ON public.payroll_history FOR ALL USING ( (SELECT auth.uid() FROM employees WHERE id = employee_id) = auth.uid() );

-- Policies for HR/Admin roles
CREATE POLICY "Admins and HR can manage all employees" ON public.employees FOR ALL USING ( (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'hr') );
CREATE POLICY "Admins and HR can manage all leave requests" ON public.leave_requests FOR ALL USING ( (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'hr', 'manager') );

-- -----------------------------------------------------------------------------------------------
-- 5. SEED DATA
-- -----------------------------------------------------------------------------------------------
-- Insert sample data to populate the database for development and testing.

-- Seed Departments
INSERT INTO public.departments (name) VALUES
('Administration'), ('Human Resources'), ('Engineering'), ('Quality Assurance'), 
('Process Excellence'), ('Customer Support'), ('Marketing'), ('Finance'), 
('IT'), ('Operations'), ('Client Services'), ('Learning & Development');

-- To seed users and employees, you would typically run a script after users sign up via Supabase Auth.
-- The following is a conceptual example. Replace UUIDs with actual auth.users.id values.

-- Example: Seed an Admin User (assuming a user with this email and ID exists in auth.users)
-- WITH admin_user AS (
--   INSERT INTO public.users (id, email, role)
--   VALUES ('8a7b6c5d-4e3f-2g1h-9i0j-k1l2m3n4o5p6', 'admin@optitalent.com', 'admin')
--   RETURNING id
-- )
-- INSERT INTO public.employees (user_id, department_id, full_name, job_title, employee_id)
-- SELECT
--   au.id,
--   d.id,
--   'Admin User',
--   'System Administrator',
--   'PEP0001'
-- FROM admin_user au, departments d WHERE d.name = 'Administration';

-- Example: Seed an HR User
-- WITH hr_user AS (
--   INSERT INTO public.users (id, email, role)
--   VALUES ('1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p7', 'hr@optitalent.com', 'hr')
--   RETURNING id
-- )
-- INSERT INTO public.employees (user_id, department_id, full_name, job_title, employee_id)
-- SELECT
--   hu.id,
--   d.id,
--   'Jackson Lee',
--   'HR Manager',
--   'PEP0002'
-- FROM hr_user hu, departments d WHERE d.name = 'Human Resources';

-- Example: Seed a Manager and an Employee they manage
-- WITH manager_user AS (
--   INSERT INTO public.users (id, email, role)
--   VALUES ('c1d2e3f4-a5b6-c7d8-e9f0-g1h2i3j4k5l6', 'manager@optitalent.com', 'manager')
--   RETURNING id
-- ),
-- manager_employee AS (
--   INSERT INTO public.employees (user_id, department_id, full_name, job_title, employee_id)
--   SELECT
--     mu.id,
--     d.id,
--     'Isabella Nguyen',
--     'Engineering Manager',
--     'PEP0003'
--   FROM manager_user mu, departments d WHERE d.name = 'Engineering'
--   RETURNING id
-- ),
-- employee_user AS (
--   INSERT INTO public.users (id, email, role)
--   VALUES ('a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p8', 'employee@optitalent.com', 'employee')
--   RETURNING id
-- )
-- INSERT INTO public.employees (user_id, manager_id, department_id, full_name, job_title, employee_id)
-- SELECT
--   eu.id,
--   me.id,
--   d.id,
--   'Anika Sharma',
--   'Software Engineer',
--   'PEP0012'
-- FROM employee_user eu, manager_employee me, departments d WHERE d.name = 'Engineering';


-- Enable RLS again
ALTER ROLE postgres SET pgaudit.log = 'all';

-- -----------------------------------------------------------------------------------------------
-- END OF SCRIPT
-- -----------------------------------------------------------------------------------------------
