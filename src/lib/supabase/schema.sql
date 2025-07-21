
-- Enable RLS for all tables
-- This is a security best practice. Specific access policies will be defined below.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM public;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM public;

-- Drop existing tables if they exist to ensure a clean slate
-- This is useful for development but should be used with caution in production.
DROP TABLE IF EXISTS "company_posts" CASCADE;
DROP TABLE IF EXISTS "leave_requests" CASCADE;
DROP TABLE IF EXISTS "leave_balances" CASCADE;
DROP TABLE IF EXISTS "applicants" CASCADE;
DROP TABLE IF EXISTS "job_openings" CASCADE;
DROP TABLE IF EXISTS "employees" CASCADE;
DROP TABLE IF EXISTS "departments" CASCADE;

-- Create Departments Table
-- Stores the different departments within the company.
CREATE TABLE IF NOT EXISTS "departments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL UNIQUE,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE "departments" IS 'Stores company departments.';

-- Create Employees Table
-- Stores information about all employees. This table links to Supabase Auth users via the "id" field.
CREATE TABLE IF NOT EXISTS "employees" (
    "id" uuid PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "employee_id" character varying(255) NOT NULL UNIQUE,
    "full_name" character varying(255),
    "email" character varying(255) NOT NULL UNIQUE,
    "job_title" character varying(255),
    "department_id" uuid REFERENCES departments(id) ON DELETE SET NULL,
    "manager_id" uuid REFERENCES employees(id) ON DELETE SET NULL,
    "hire_date" date,
    "status" character varying(50) DEFAULT 'Active'::character varying,
    "profile_picture_url" text,
    "phone_number" character varying(255),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "role" character varying(50) DEFAULT 'employee'::character varying NOT NULL,
    "skills" jsonb,
    "emergency_contact" jsonb
);
COMMENT ON TABLE "employees" IS 'Stores employee profile data, linking to auth.users.';

-- Create Job Openings Table
-- Stores job postings for the recruitment process.
CREATE TABLE IF NOT EXISTS "job_openings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "description" text,
    "department_id" uuid REFERENCES departments(id) ON DELETE SET NULL,
    "status" text DEFAULT 'Open'::text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "company_logo" text,
    UNIQUE(title)
);
COMMENT ON TABLE "job_openings" IS 'Stores job postings.';

-- Create Applicants Table
-- Stores information about candidates who have applied for jobs.
CREATE TABLE IF NOT EXISTS "applicants" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "full_name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "phone_number" text,
    "status" text DEFAULT 'Applied'::text,
    "job_opening_id" uuid REFERENCES job_openings(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "resume_url" text,
    "profile_picture" text
);
COMMENT ON TABLE "applicants" IS 'Stores candidate information.';

-- Create Leave Balances Table
-- Tracks the remaining leave days for each employee.
CREATE TABLE IF NOT EXISTS "leave_balances" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "employee_id" uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    "leave_type" text NOT NULL,
    "balance" integer NOT NULL,
    UNIQUE(employee_id, leave_type)
);
COMMENT ON TABLE "leave_balances" IS 'Tracks available leave for each employee.';

-- Create Leave Requests Table
-- Stores leave requests submitted by employees.
CREATE TABLE IF NOT EXISTS "leave_requests" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "employee_id" uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    "leave_type" text NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "reason" text,
    "status" text DEFAULT 'Pending'::text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE "leave_requests" IS 'Stores employee leave requests.';

-- Create Company Posts Table
-- For the company social feed.
CREATE TABLE IF NOT EXISTS "company_posts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "author_id" uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    "title" text NOT NULL,
    "content" text,
    "image_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE "company_posts" IS 'Stores posts for the company feed.';

-- Enable RLS policies
-- Note: Specific policies need to be created for each table to control access.
ALTER TABLE "departments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "job_openings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "applicants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leave_balances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leave_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "company_posts" ENABLE ROW LEVEL SECURITY;

-- Grant usage on schema to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant all privileges to the 'service_role' for administrative tasks
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant select permissions for public (anon) and authenticated users on specific tables
-- This allows read access, which will be further restricted by RLS policies.
GRANT SELECT ON TABLE "departments" TO anon;
GRANT SELECT ON TABLE "departments" TO authenticated;
GRANT SELECT ON TABLE "job_openings" TO anon;
GRANT SELECT ON TABLE "job_openings" TO authenticated;

-- Grant permissions for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "employees" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "applicants" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "leave_balances" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "leave_requests" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "company_posts" TO authenticated;

-- RLS POLICIES
-- Example: Allow users to see their own employee data
CREATE POLICY "Allow individual read access" ON "employees"
FOR SELECT USING (auth.uid() = id);

-- Example: Allow users to update their own profile
CREATE POLICY "Allow individual update access" ON "employees"
FOR UPDATE USING (auth.uid() = id);

-- Example: Allow users to view their own leave requests
CREATE POLICY "Allow individual read access on leave requests" ON "leave_requests"
FOR SELECT USING (auth.uid() = employee_id);

-- Example: Allow managers to see leave requests of their direct reports
CREATE POLICY "Allow manager read access on leave requests" ON "leave_requests"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE employees.id = leave_requests.employee_id AND employees.manager_id = auth.uid()
  )
);
