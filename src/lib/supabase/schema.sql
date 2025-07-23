
-- This file is intentionally left blank.
-- The database schema is no longer required for the frontend-only prototype,
-- as all data is now mocked.
-- Drop all tables with cascade to handle dependencies
DROP TABLE IF EXISTS "public"."assessment_answers" CASCADE;
DROP TABLE IF EXISTS "public"."assessment_questions" CASCADE;
DROP TABLE IF EXISTS "public"."assessment_results" CASCADE;
DROP TABLE IF EXISTS "public"."assessments" CASCADE;
DROP TABLE IF EXISTS "public"."assessment_sections" CASCADE;
DROP TABLE IF EXISTS "public"."company_posts" CASCADE;
DROP TABLE IF EXISTS "public"."documents" CASCADE;
DROP TABLE IF EXISTS "public"."leave_balances" CASCADE;
DROP TABLE IF EXISTS "public"."leave_requests" CASCADE;
DROP TABLE IF EXISTS "public"."notifications" CASCADE;
DROP TABLE IF EXISTS "public"."employees" CASCADE;
DROP TABLE IF EXISTS "public"."departments" CASCADE;
DROP TABLE IF EXISTS "public"."roles" CASCADE;

-- Custom ENUM types for status fields
CREATE TYPE role AS ENUM ('admin', 'hr', 'manager', 'employee', 'recruiter', 'it head', 'finance head', 'marketing head', 'operations head', 'team lead', 'qa analyst');
CREATE TYPE job_status AS ENUM ('Open', 'Paused', 'Closed');
CREATE TYPE departments AS ENUM ('hr department', 'finance department', 'marketing department', 'operations department', 'team lead department', 'qa analyst department');
CREATE TYPE applicant_status AS ENUM ('New', 'Screening', 'Interviewing', 'Offer Sent', 'Hired', 'Rejected');
CREATE TYPE leave_type AS ENUM ('Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'WFH', 'Optional');
CREATE TYPE leave_status AS ENUM ('Pending', 'Approved', 'Rejected');


-- Create Roles Table
CREATE TABLE IF NOT EXISTS "public"."roles" (
    "name" TEXT PRIMARY KEY,
    "description" TEXT,
    "departments",
    "permissions" JSONB
);
COMMENT ON TABLE "public"."roles" IS 'Defines user roles and their associated permissions.';

-- Create Departments Table
CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT UNIQUE NOT NULL,
    "head_id" UUID, -- Can be null if no head is assigned
    "description" TEXT
);
COMMENT ON TABLE "public"."departments" IS 'Stores company departments.';

-- Create Employees Table
CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" UUID PRIMARY KEY REFERENCES "auth"."users" ON DELETE CASCADE,
    "employee_id" TEXT UNIQUE NOT NULL,
    "full_name" TEXT,
    "email" TEXT UNIQUE NOT NULL,
    "role" TEXT REFERENCES "public"."roles"("name"),
    "department_id" UUID REFERENCES "public"."departments"("id"),
    "manager_id" UUID REFERENCES "public"."employees"("id"),
    "status" TEXT DEFAULT 'active',
    "hire_date" DATE,
    "profile_picture_url" TEXT,
    "phone_number" TEXT,
    "profile_complete" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "public"."employees" IS 'Stores employee profile information.';
-- Add foreign key constraint for department head after employees table is created
ALTER TABLE "public"."departments" ADD FOREIGN KEY ("head_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL;


-- Create Assessments Table
CREATE TABLE IF NOT EXISTS "public"."assessments" (
    "id" SERIAL PRIMARY KEY,
    "role" TEXT,
    "title" TEXT,
    "questions" JSONB,
    "created_by" TEXT REFERENCES "public"."employees"("employee_id"),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "public"."assessments" IS 'Stores assessment and quiz templates.';


-- Create Assessment Results Table
CREATE TABLE IF NOT EXISTS "public"."assessment_results" (
    "id" SERIAL PRIMARY KEY,
    "employee_id" TEXT REFERENCES "public"."employees"("employee_id"),
    "assessment_id" INT REFERENCES "public"."assessments"("id"),
    "score" INT,
    "answers" JSONB,
    "submitted_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "public"."assessment_results" IS 'Stores results of completed assessments.';

-- Create Documents Table
CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" SERIAL PRIMARY KEY,
    "employee_id" TEXT REFERENCES "public"."employees"("employee_id"),
    "type" TEXT,
    "url" TEXT,
    "uploaded_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "public"."documents" IS 'Stores employee-related documents.';

-- Create Leaves Table
CREATE TABLE IF NOT EXISTS "public"."leaves" (
    "id" SERIAL PRIMARY KEY,
    "employee_id" TEXT REFERENCES "public"."employees"("employee_id"),
    "type" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "reason" TEXT,
    "status" TEXT DEFAULT 'pending',
    "approved_by" TEXT,
    "applied_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "public"."leaves" IS 'Tracks employee leave requests.';

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" SERIAL PRIMARY KEY,
    "employee_id" TEXT REFERENCES "public"."employees"("employee_id"),
    "title" TEXT,
    "message" TEXT,
    "seen" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "public"."notifications" IS 'Stores notifications for users.';
