-- -------------------------------------------------------------
-- -------------------------------------------------------------
--
--  OptiTalent HRMS Database Schema
--  Version: 1.0
--
-- -------------------------------------------------------------
-- -------------------------------------------------------------

-- -------------------------------------------------------------
--  HELPER FUNCTIONS
-- -------------------------------------------------------------

-- Function to extract a specific claim from the JWT.
--
--  example: select get_my_claim('employee_id');
--
create or replace function get_my_claim(claim text) returns jsonb as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb ->> claim, null)::jsonb;
$$ language sql stable;

--
-- Function to get all claims from the JWT.
--
--  example: select get_my_claims();
--
create or replace function get_my_claims() returns jsonb as $$
  select coalesce(current_setting('request.jwt.claims', true), '{}')::jsonb;
$$ language sql stable;


-- -------------------------------------------------------------
--  TABLE DROPS
--
--  Drop tables in reverse order of creation to avoid
--  dependency issues. Using CASCADE to handle all dependent
--  objects automatically.
-- -------------------------------------------------------------
DROP TABLE IF EXISTS "public"."team_members" CASCADE;
DROP TABLE IF EXISTS "public"."leave_requests" CASCADE;
DROP TABLE IF EXISTS "public"."helpdesk_tickets" CASCADE;
DROP TABLE IF EXISTS "public"."assessment_answers" CASCADE;
DROP TABLE IF EXISTS "public"."assessment_attempts" CASCADE;
DROP TABLE IF EXISTS "public"."assessment_questions" CASCADE;
DROP TABLE IF EXISTS "public"."assessment_sections" CASCADE;
DROP TABLE IF EXISTS "public"."assessments" CASCADE;
DROP TABLE IF EXISTS "public"."asset_assignments" CASCADE;
DROP TABLE IF EXISTS "public"."it_assets" CASCADE;
DROP TABLE IF EXISTS "public"."employee_tasks" CASCADE;
DROP TABLE IF EXISTS "public"."onboarding_tasks" CASCADE;
DROP TABLE IF EXISTS "public"."payroll_records" CASCADE;
DROP TABLE IF EXISTS "public"."expense_claims" CASCADE;
DROP TABLE IF EXISTS "public"."purchase_orders" CASCADE;
DROP TABLE IF EXISTS "public"."timesheets" CASCADE;
DROP TABLE IF EXISTS "public"."performance_reviews" CASCADE;
DROP TABLE IF EXISTS "public"."interview_schedules" CASCADE;
DROP TABLE IF EXISTS "public"."applicants" CASCADE;
DROP TABLE IF EXISTS "public"."job_openings" CASCADE;
DROP TABLE IF EXISTS "public"."company_posts" CASCADE;
DROP TABLE IF EXISTS "public"."teams" CASCADE;
DROP TABLE IF EXISTS "public"."budgets" CASCADE;
DROP TABLE IF EXISTS "public"."employee_compliance_status" CASCADE;
DROP TABLE IF EXISTS "public"."employee_awards" CASCADE;
DROP TABLE IF EXISTS "public"."weekly_award_stats" CASCADE;
DROP TABLE IF EXISTS "public"."compliance_modules" CASCADE;
DROP TABLE IF EXISTS "public"."coaching_sessions" CASCADE;
DROP TABLE IF EXISTS "public"."maintenance_schedules" CASCADE;
DROP TABLE IF EXISTS "public"."production_lines" CASCADE;
DROP TABLE IF EXISTS "public"."employees" CASCADE;
DROP TABLE IF EXISTS "public"."departments" CASCADE;

-- -------------------------------------------------------------
--  TABLE CREATION
-- -------------------------------------------------------------

-- Departments Table
-- Stores all company departments.
CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "departments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "departments_name_key" UNIQUE ("name")
) tablespace pg_default;
ALTER TABLE "public"."departments" OWNER TO postgres;
ALTER TABLE "public"."departments" ENABLE ROW LEVEL SECURITY;

-- Employees Table
-- Core table for all employee data. Links to Supabase Auth users.
CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" uuid NOT NULL,
    "employee_id" character varying,
    "full_name" character varying,
    "email" character varying NOT NULL,
    "job_title" character varying,
    "department_id" uuid,
    "manager_id" uuid,
    "hire_date" date,
    "status" character varying DEFAULT 'Active'::character varying,
    "profile_picture_url" text,
    "phone_number" character varying,
    "emergency_contact" jsonb,
    "bio" text,
    "skills" jsonb,
    "linkedin_profile" character varying,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now(),
    "role" character varying DEFAULT 'employee'::character varying,
    CONSTRAINT "employees_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "employees_email_key" UNIQUE ("email"),
    CONSTRAINT "employees_employee_id_key" UNIQUE ("employee_id"),
    CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL,
    CONSTRAINT "employees_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "employees_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL
) tablespace pg_default;
ALTER TABLE "public"."employees" OWNER TO postgres;
ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."departments" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "public"."employees" ALTER COLUMN "status" SET DEFAULT 'Active'::character varying;
ALTER TABLE "public"."employees" ALTER COLUMN "role" SET DEFAULT 'employee'::character varying;


-- Compliance Modules Table
-- Lists all compliance training modules.
CREATE TABLE IF NOT EXISTS "public"."compliance_modules" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "title" character varying NOT NULL,
    "description" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "compliance_modules_pkey" PRIMARY KEY ("id")
) tablespace pg_default;
ALTER TABLE "public"."compliance_modules" OWNER TO postgres;
ALTER TABLE "public"."compliance_modules" ENABLE ROW LEVEL SECURITY;


-- Employee Compliance Status
-- Tracks completion of compliance modules for each employee.
CREATE TABLE IF NOT EXISTS "public"."employee_compliance_status" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "employee_id" uuid NOT NULL,
    "module_id" uuid NOT NULL,
    "status" character varying DEFAULT 'Pending'::character varying NOT NULL,
    "completed_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "employee_compliance_status_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "employee_compliance_status_employee_id_module_id_key" UNIQUE ("employee_id", "module_id"),
    CONSTRAINT "employee_compliance_status_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE,
    CONSTRAINT "employee_compliance_status_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."compliance_modules"("id") ON DELETE CASCADE
) tablespace pg_default;
ALTER TABLE "public"."employee_compliance_status" OWNER TO postgres;
ALTER TABLE "public"."employee_compliance_status" ENABLE ROW LEVEL SECURITY;


-- Teams Table
-- Defines teams within departments.
CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" character varying NOT NULL,
    "department_id" uuid NOT NULL,
    "team_lead_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "teams_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "teams_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE,
    CONSTRAINT "teams_team_lead_id_fkey" FOREIGN KEY ("team_lead_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL
) tablespace pg_default;
ALTER TABLE "public"."teams" OWNER TO postgres;
ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;

-- Team Members Table
-- Junction table linking employees to teams.
CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "team_id" uuid NOT NULL,
    "employee_id" uuid NOT NULL,
    CONSTRAINT "team_members_pkey" PRIMARY KEY ("team_id", "employee_id"),
    CONSTRAINT "team_members_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE,
    CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE
) tablespace pg_default;
ALTER TABLE "public"."team_members" OWNER TO postgres;
ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;

-- Job Openings Table
-- Stores details about job vacancies.
CREATE TABLE IF NOT EXISTS "public"."job_openings" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "title" character varying NOT NULL,
    "department_id" uuid,
    "description" text,
    "status" character varying DEFAULT 'Open'::character varying NOT NULL,
    "posted_at" timestamp with time zone DEFAULT now() NOT NULL,
    "company_logo" text,
    CONSTRAINT "job_openings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "job_openings_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL
) tablespace pg_default;
ALTER TABLE "public"."job_openings" OWNER TO postgres;
ALTER TABLE "public"."job_openings" ENABLE ROW LEVEL SECURITY;


-- Applicants Table
-- Stores information about job applicants.
CREATE TABLE IF NOT EXISTS "public"."applicants" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "full_name" character varying NOT NULL,
    "email" character varying NOT NULL,
    "phone_number" character varying,
    "resume_url" text,
    "status" character varying DEFAULT 'Applied'::character varying NOT NULL,
    "job_opening_id" uuid,
    "applied_at" timestamp with time zone DEFAULT now() NOT NULL,
    "profile_picture" text,
    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "applicants_email_job_opening_id_key" UNIQUE ("email", "job_opening_id"),
    CONSTRAINT "applicants_job_opening_id_fkey" FOREIGN KEY ("job_opening_id") REFERENCES "public"."job_openings"("id") ON DELETE SET NULL
) tablespace pg_default;
ALTER TABLE "public"."applicants" OWNER TO postgres;
ALTER TABLE "public"."applicants" ENABLE ROW LEVEL SECURITY;


-- Performance Reviews Table
-- Records performance review data for employees.
CREATE TABLE IF NOT EXISTS "public"."performance_reviews" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "employee_id" uuid NOT NULL,
    "reviewer_id" uuid NOT NULL,
    "review_period" character varying,
    "rating" integer,
    "comments" text,
    "review_date" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "performance_reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT "performance_reviews_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE,
    CONSTRAINT "performance_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE
) tablespace pg_default;
ALTER TABLE "public"."performance_reviews" OWNER TO postgres;
ALTER TABLE "public"."performance_reviews" ENABLE ROW LEVEL SECURITY;


-- Leave Requests Table
-- Manages employee leave applications.
CREATE TABLE IF NOT EXISTS "public"."leave_requests" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "employee_id" uuid NOT NULL,
    "leave_type" character varying NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "reason" text,
    "status" character varying DEFAULT 'Pending'::character varying NOT NULL,
    "requested_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE
) tablespace pg_default;
ALTER TABLE "public"."leave_requests" OWNER TO postgres;
ALTER TABLE "public"."leave_requests" ENABLE ROW LEVEL SECURITY;


-- Company Posts
-- For company-wide announcements and social feed.
CREATE TABLE IF NOT EXISTS "public"."company_posts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "author_id" uuid NOT NULL,
    "title" text,
    "content" text NOT NULL,
    "image_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "company_posts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "company_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE
) tablespace pg_default;
ALTER TABLE "public"."company_posts" OWNER TO postgres;
ALTER TABLE "public"."company_posts" ENABLE ROW LEVEL SECURITY;


-- Assessments
-- Stores assessment templates.
CREATE TABLE IF NOT EXISTS "public"."assessments" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "title" character varying NOT NULL,
    "process_type" character varying,
    "duration" integer,
    "passing_score" integer,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE SET NULL
) tablespace pg_default;
ALTER TABLE "public"."assessments" OWNER TO postgres;
ALTER TABLE "public"."assessments" ENABLE ROW LEVEL SECURITY;

-- Assessment Sections
-- Divides an assessment into different parts (e.g., MCQ, Typing).
CREATE TABLE IF NOT EXISTS "public"."assessment_sections" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "assessment_id" uuid NOT NULL,
    "section_type" character varying NOT NULL,
    "title" character varying NOT NULL,
    "time_limit" integer,
    "order" integer,
    CONSTRAINT "assessment_sections_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessment_sections_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE
) tablespace pg_default;
ALTER TABLE "public"."assessment_sections" OWNER TO postgres;
ALTER TABLE "public"."assessment_sections" ENABLE ROW LEVEL SECURITY;

-- Assessment Questions
-- Individual questions within an assessment section.
CREATE TABLE IF NOT EXISTS "public"."assessment_questions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "section_id" uuid NOT NULL,
    "type" character varying NOT NULL,
    "question_text" text NOT NULL,
    "options" jsonb,
    "correct_answer" text,
    "audio_prompt_url" text,
    "typing_prompt" text,
    "language" character varying,
    CONSTRAINT "assessment_questions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessment_questions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."assessment_sections"("id") ON DELETE CASCADE
) tablespace pg_default;
ALTER TABLE "public"."assessment_questions" OWNER TO postgres;
ALTER TABLE "public"."assessment_questions" ENABLE ROW LEVEL SECURITY;

-- Assessment Attempts
-- Tracks an applicant's attempt at an assessment.
CREATE TABLE IF NOT EXISTS "public"."assessment_attempts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "applicant_id" uuid NOT NULL,
    "assessment_id" uuid NOT NULL,
    "started_at" timestamp with time zone DEFAULT now() NOT NULL,
    "completed_at" timestamp with time zone,
    "score" integer,
    "status" character varying DEFAULT 'In Progress'::character varying NOT NULL,
    CONSTRAINT "assessment_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessment_attempts_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE CASCADE,
    CONSTRAINT "assessment_attempts_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE
) tablespace pg_default;
ALTER TABLE "public"."assessment_attempts" OWNER TO postgres;
ALTER TABLE "public"."assessment_attempts" ENABLE ROW LEVEL SECURITY;

-- Assessment Answers
-- Stores the applicant's answers for each question.
CREATE TABLE IF NOT EXISTS "public"."assessment_answers" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "attempt_id" uuid NOT NULL,
    "question_id" uuid NOT NULL,
    "answer_text" text,
    "is_correct" boolean,
    CONSTRAINT "assessment_answers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessment_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE CASCADE,
    CONSTRAINT "assessment_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."assessment_questions"("id") ON DELETE CASCADE
) tablespace pg_default;
ALTER TABLE "public"."assessment_answers" OWNER TO postgres;
ALTER TABLE "public"."assessment_answers" ENABLE ROW LEVEL SECURITY;


-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
--
--  Enable RLS and define policies for each table.
-- -------------------------------------------------------------
-- Policies for 'departments'
CREATE POLICY "Allow read access to all authenticated users" ON "public"."departments" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin to manage departments" ON "public"."departments" FOR ALL TO service_role USING (true);

-- Policies for 'employees'
CREATE POLICY "Allow user to view their own profile" ON "public"."employees" FOR SELECT USING ((( SELECT auth.uid() AS uid) = id));
CREATE POLICY "Allow user to update their own profile" ON "public"."employees" FOR UPDATE USING ((( SELECT auth.uid() AS uid) = id));
CREATE POLICY "Allow manager to view their team members" ON "public"."employees" FOR SELECT USING (auth.uid() IN (SELECT e.manager_id FROM employees e WHERE e.id = employees.id));
CREATE POLICY "Allow admin to manage all employee profiles" ON "public"."employees" FOR ALL USING ((get_my_claim('role'::text)) = '"admin"'::jsonb);
CREATE POLICY "Allow new users to create their own employee record" ON "public"."employees" FOR INSERT WITH CHECK ((( SELECT auth.uid()) = id));

-- Policies for 'company_posts'
CREATE POLICY "Allow read access to all authenticated users" ON "public"."company_posts" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/hr to create posts" ON "public"."company_posts" FOR INSERT WITH CHECK (((get_my_claim('role'::text)) = '"admin"'::jsonb) OR ((get_my_claim('role'::text)) = '"hr"'::jsonb));
CREATE POLICY "Allow author to update their own posts" ON "public"."company_posts" FOR UPDATE USING ((( SELECT auth.uid() AS uid) = author_id));
CREATE POLICY "Allow author to delete their own posts" ON "public"."company_posts" FOR DELETE USING ((( SELECT auth.uid() AS uid) = author_id));

-- Policies for 'leave_requests'
CREATE POLICY "Allow user to manage their own leave requests" ON "public"."leave_requests" FOR ALL USING ((( SELECT auth.uid() AS uid) = employee_id));
CREATE POLICY "Allow manager to view their team's leave requests" ON "public"."leave_requests" FOR SELECT USING (employee_id IN (SELECT e.id FROM employees e WHERE e.manager_id = auth.uid()));
CREATE POLICY "Allow admin/hr to manage all leave requests" ON "public"."leave_requests" FOR ALL USING (((get_my_claim('role'::text)) = '"admin"'::jsonb) OR ((get_my_claim('role'::text)) = '"hr"'::jsonb));

-- Policies for 'job_openings'
CREATE POLICY "Allow authenticated users to view job openings" ON "public"."job_openings" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/hr/recruiter to manage job openings" ON "public"."job_openings" FOR ALL USING (((get_my_claim('role'::text)) = '"admin"'::jsonb) OR ((get_my_claim('role'::text)) = '"hr"'::jsonb) OR ((get_my_claim('role'::text)) = '"recruiter"'::jsonb));

-- Policies for 'applicants'
CREATE POLICY "Allow admin/hr/recruiter to manage applicants" ON "public"."applicants" FOR ALL USING (((get_my_claim('role'::text)) = '"admin"'::jsonb) OR ((get_my_claim('role'::text)) = '"hr"'::jsonb) OR ((get_my_claim('role'::text)) = '"recruiter"'::jsonb));
CREATE POLICY "Allow anonymous users to apply (create applicants)" ON "public"."applicants" FOR INSERT TO anon WITH CHECK (true);

-- Policies for 'assessments'
CREATE POLICY "Allow admin/hr to manage assessments" ON "public"."assessments" FOR ALL USING (((get_my_claim('role'::text)) = '"admin"'::jsonb) OR ((get_my_claim('role'::text)) = '"hr"'::jsonb));
CREATE POLICY "Allow employees/applicants to view assigned assessments" ON "public"."assessments" FOR SELECT TO authenticated USING (true); -- This might need to be more specific based on assignment logic

-- Add other RLS policies for remaining tables as needed, following a similar pattern.
-- It's crucial to have a default-deny policy and explicitly grant permissions.
-- ... (rest of policies)
