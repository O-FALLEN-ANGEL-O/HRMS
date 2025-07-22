-- Drop existing tables in reverse order of dependency to avoid foreign key conflicts.
DROP TABLE IF EXISTS "public"."leave_requests";
DROP TABLE IF EXISTS "public"."leave_balances";
DROP TABLE IF EXISTS "public"."company_posts";
DROP TABLE IF EXISTS "public"."applicants";
DROP TABLE IF EXISTS "public"."job_openings";
DROP TABLE IF EXISTS "public"."employees";
DROP TABLE IF EXISTS "public"."departments";

-- Create Departments Table
-- Stores organizational departments.
CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "departments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "departments_name_key" UNIQUE ("name")
);

-- Create Employees Table
-- Stores employee profile data, linked to auth users.
CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" uuid NOT NULL,
    "employee_id" text NOT NULL,
    "full_name" text,
    "email" text NOT NULL,
    "job_title" text,
    "department_id" uuid,
    "manager_id" uuid,
    "hire_date" timestamp with time zone,
    "status" text,
    "profile_picture_url" text,
    "phone_number" text,
    "role" text,
    "emergency_contact" jsonb,
    "skills" jsonb,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "employees_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "employees_email_key" UNIQUE ("email"),
    CONSTRAINT "employees_employee_id_key" UNIQUE ("employee_id"),
    CONSTRAINT "employees_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE,
    CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments" ("id"),
    CONSTRAINT "employees_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."employees" ("id")
);

-- Create Job Openings Table
-- Stores active job listings.
CREATE TABLE IF NOT EXISTS "public"."job_openings" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "department_id" uuid,
    "company_logo" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "job_openings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "job_openings_title_key" UNIQUE ("title"),
    CONSTRAINT "job_openings_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments" ("id")
);

-- Create Applicants Table
-- Stores information about candidates who applied for jobs.
CREATE TABLE IF NOT EXISTS "public"."applicants" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "full_name" text,
    "email" text,
    "phone_number" text,
    "status" text,
    "job_opening_id" uuid,
    "profile_picture" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "applicants_job_opening_id_fkey" FOREIGN KEY ("job_opening_id") REFERENCES "public"."job_openings" ("id")
);

-- Create Company Posts Table
-- For the internal company feed.
CREATE TABLE IF NOT EXISTS "public"."company_posts" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "author_id" uuid NOT NULL,
    "title" text,
    "content" text,
    "image_url" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "company_posts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "company_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."employees" ("id")
);

-- Create Leave Balances Table
-- Tracks available leave days for each employee.
CREATE TABLE IF NOT EXISTS "public"."leave_balances" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "employee_id" uuid NOT NULL,
    "leave_type" text NOT NULL,
    "balance" integer NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "leave_balances_employee_id_leave_type_key" UNIQUE ("employee_id", "leave_type"),
    CONSTRAINT "leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees" ("id") ON DELETE CASCADE
);

-- Create Leave Requests Table
-- Tracks all leave requests made by employees.
CREATE TABLE IF NOT EXISTS "public"."leave_requests" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "employee_id" uuid NOT NULL,
    "leave_type" text NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "days" integer NOT NULL,
    "reason" text,
    "status" text NOT NULL DEFAULT 'Pending'::text,
    "approved_by" uuid,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "leave_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."employees" ("id"),
    CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees" ("id") ON DELETE CASCADE
);

-- Add comments to tables and columns for better understanding in Supabase UI
COMMENT ON TABLE "public"."employees" IS 'Stores public-facing profile information for users.';
COMMENT ON TABLE "public"."departments" IS 'Stores organizational departments like Engineering, HR, etc.';
COMMENT ON TABLE "public"."job_openings" IS 'Stores details about currently open job positions.';
COMMENT ON TABLE "public"."applicants" IS 'Stores information about candidates who have applied for jobs.';
COMMENT ON TABLE "public"."company_posts" IS 'Stores posts for the internal company social feed.';
COMMENT ON TABLE "public"."leave_balances" IS 'Tracks the remaining leave balance for each employee by leave type.';
COMMENT ON TABLE "public"."leave_requests" IS 'Logs all leave requests made by employees.';
