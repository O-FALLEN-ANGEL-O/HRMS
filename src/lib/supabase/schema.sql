
-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" with schema "extensions";

-- Define custom enum types for roles and statuses to ensure data consistency.
-- Enums help enforce that only specific values are used in columns.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_role') THEN
        CREATE TYPE public.employee_role AS ENUM (
            'admin', 'hr', 'manager', 'recruiter', 'qa-analyst', 'process-manager', 
            'team-leader', 'marketing', 'finance', 'it-manager', 'operations-manager', 'employee'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_status') THEN
        CREATE TYPE public.employee_status AS ENUM ('Active', 'Inactive', 'On Leave');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leave_status') THEN
        CREATE TYPE public.leave_status AS ENUM ('Pending', 'Approved', 'Rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'applicant_status') THEN
        CREATE TYPE public.applicant_status AS ENUM ('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_status') THEN
        CREATE TYPE public.asset_status AS ENUM ('Available', 'Assigned', 'In Repair', 'Retired');
    END IF;
END$$;


-- Create Departments Table
-- Stores all company departments.
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;


-- Create Employees Table
-- The central table for all user profiles, linked to Supabase Auth and departments.
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    job_title TEXT,
    department_id UUID REFERENCES public.departments(id),
    manager_id UUID REFERENCES public.employees(id),
    hire_date DATE,
    status employee_status DEFAULT 'Active',
    profile_picture_url TEXT,
    phone_number TEXT,
    emergency_contact JSONB,
    bio TEXT,
    skills JSONB,
    linkedin_profile TEXT,
    role employee_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;


-- Create Job Openings Table
-- For managing recruitment pipelines.
CREATE TABLE IF NOT EXISTS public.job_openings (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    department_id UUID REFERENCES public.departments(id),
    status TEXT DEFAULT 'Open',
    company_logo TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;


-- Create Applicants Table
-- Stores information about candidates who have applied for jobs.
CREATE TABLE IF NOT EXISTS public.applicants (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    status applicant_status DEFAULT 'Applied',
    job_opening_id UUID REFERENCES public.job_openings(id),
    resume_url TEXT,
    profile_picture TEXT,
    application_date DATE DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;


-- Create Company Posts Table
-- For the internal company social feed.
CREATE TABLE IF NOT EXISTS public.company_posts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.employees(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.company_posts ENABLE ROW LEVEL SECURITY;


-- Create IT Assets Table
-- Tracks all company hardware and software assets.
CREATE TABLE IF NOT EXISTS public.it_assets (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    asset_tag TEXT NOT NULL UNIQUE,
    asset_type TEXT NOT NULL,
    model TEXT,
    status asset_status DEFAULT 'Available',
    purchase_date DATE,
    warranty_end_date DATE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.it_assets ENABLE ROW LEVEL SECURITY;


-- Create Asset Assignments Table
-- Links IT assets to employees.
CREATE TABLE IF NOT EXISTS public.asset_assignments (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES public.it_assets(id),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    assignment_date DATE NOT NULL,
    return_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;


-- Create Performance Reviews Table
-- Stores records of employee performance reviews.
CREATE TABLE IF NOT EXISTS public.performance_reviews (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    reviewer_id UUID NOT NULL REFERENCES public.employees(id),
    review_period TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    goals TEXT,
    achievements TEXT,
    areas_for_improvement TEXT,
    review_date DATE DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;


-- Create Leave Balances Table
-- Tracks available leave days for each employee.
CREATE TABLE IF NOT EXISTS public.leave_balances (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    leave_type TEXT NOT NULL,
    balance INT NOT NULL,
    UNIQUE(employee_id, leave_type)
);
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;


-- Create Leave Requests Table
-- Manages all employee leave requests and their approval status.
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    approver_id UUID REFERENCES public.employees(id),
    leave_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status leave_status DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;


-- Create Employee Awards Table
-- For the bonus points and recognition system.
CREATE TABLE IF NOT EXISTS public.employee_awards (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    giver_id UUID NOT NULL REFERENCES public.employees(id),
    receiver_id UUID NOT NULL REFERENCES public.employees(id),
    points INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.employee_awards ENABLE ROW LEVEL SECURITY;

-- Note: Policies for Row Level Security (RLS) are not defined in this schema.
-- In a production environment, you would add `CREATE POLICY` statements here
-- to control which users can read/write data in each table.
-- Example:
-- CREATE POLICY "Employees can view their own profile" ON public.employees
-- FOR SELECT USING (auth.uid() = id);

