-- Drop existing tables and types to start fresh
DROP TABLE IF EXISTS "employees", "departments", "leave_requests", "leave_balances", "job_openings", "applicants", "company_posts" CASCADE;
DROP TYPE IF EXISTS "user_role", "leave_type", "leave_status", "applicant_status";

-- Create custom types (enums)
CREATE TYPE "user_role" AS ENUM (
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
  'operations-manager'
);

CREATE TYPE "leave_type" AS ENUM ('Sick Leave', 'Casual Leave', 'Paid Time Off', 'Work From Home');

CREATE TYPE "leave_status" AS ENUM ('Pending', 'Approved', 'Rejected');

CREATE TYPE "applicant_status" AS ENUM ('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected');

-- Create tables
CREATE TABLE "departments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text UNIQUE NOT NULL,
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE "employees" (
  "id" uuid PRIMARY KEY,
  "employee_id" text UNIQUE NOT NULL,
  "full_name" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "phone_number" text,
  "job_title" text,
  "department_id" uuid REFERENCES "departments"("id"),
  "manager_id" uuid REFERENCES "employees"("id"),
  "hire_date" date,
  "role" user_role NOT NULL,
  "status" text DEFAULT 'Active',
  "profile_picture_url" text,
  "emergency_contact" jsonb,
  "skills" jsonb,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

CREATE TABLE "job_openings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text UNIQUE NOT NULL,
  "description" text,
  "department_id" uuid REFERENCES "departments"("id"),
  "status" text DEFAULT 'Open',
  "company_logo" text,
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE "applicants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "full_name" text NOT NULL,
  "email" text NOT NULL,
  "phone_number" text,
  "resume_url" text,
  "profile_picture" text,
  "job_opening_id" uuid REFERENCES "job_openings"("id"),
  "status" applicant_status DEFAULT 'Applied',
  "notes" text,
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE "leave_balances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "employee_id" uuid NOT NULL REFERENCES "employees"("id"),
  "leave_type" leave_type NOT NULL,
  "balance" int NOT NULL,
  UNIQUE("employee_id", "leave_type")
);

CREATE TABLE "leave_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "employee_id" uuid NOT NULL REFERENCES "employees"("id"),
  "leave_type" leave_type NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "reason" text,
  "status" leave_status DEFAULT 'Pending',
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE "company_posts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "author_id" uuid NOT NULL REFERENCES "employees"("id"),
    "title" text NOT NULL,
    "content" text,
    "image_url" text,
    "created_at" timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON departments FOR SELECT USING (true);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to see their own profile" ON employees FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON employees FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow HR/Admins to see all profiles" ON employees FOR SELECT USING (
  (SELECT role FROM employees WHERE id = auth.uid()) IN ('admin', 'hr')
);
CREATE POLICY "Allow Managers to see their team" ON employees FOR SELECT USING (
    department_id = (SELECT department_id FROM employees WHERE id = auth.uid())
);

ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read for job openings" ON job_openings FOR SELECT USING (true);
CREATE POLICY "Allow admin/hr/recruiter to manage openings" ON job_openings FOR ALL USING (
    (SELECT role FROM employees WHERE id = auth.uid()) IN ('admin', 'hr', 'recruiter')
);

ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin/hr/recruiter to manage applicants" ON applicants FOR ALL USING (
    (SELECT role FROM employees WHERE id = auth.uid()) IN ('admin', 'hr', 'recruiter')
);

ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own leave balances" ON leave_balances FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Managers/HR can view team leave balances" ON leave_balances FOR SELECT USING (
    (SELECT role FROM employees WHERE id = auth.uid()) IN ('admin', 'hr', 'manager') AND
    employee_id IN (SELECT id FROM employees WHERE department_id = (SELECT department_id FROM employees WHERE id = auth.uid()))
);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own leave requests" ON leave_requests FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Managers/HR can manage team leave requests" ON leave_requests FOR ALL USING (
    (SELECT role FROM employees WHERE id = auth.uid()) IN ('admin', 'hr', 'manager') AND
    employee_id IN (SELECT id FROM employees WHERE department_id = (SELECT department_id FROM employees WHERE id = auth.uid()))
);

ALTER TABLE company_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow logged-in users to see posts" ON company_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins/hr to create posts" ON company_posts FOR INSERT WITH CHECK (
    (SELECT role FROM employees WHERE id = auth.uid()) IN ('admin', 'hr')
);
