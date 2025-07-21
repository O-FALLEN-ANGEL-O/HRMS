-- Drop existing tables in reverse order of dependency
DROP TABLE IF EXISTS helpdesk_messages;
DROP TABLE IF EXISTS helpdesk_tickets;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS asset_assignments;
DROP TABLE IF EXISTS software_licenses;
DROP TABLE IF EXISTS it_assets;
DROP TABLE IF EXISTS employee_tasks;
DROP TABLE IF EXISTS onboarding_tasks;
DROP TABLE IF EXISTS assessment_answers;
DROP TABLE IF EXISTS assessment_attempts;
DROP TABLE IF EXISTS assessment_questions;
DROP TABLE IF EXISTS assessment_sections;
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS payroll_records;
DROP TABLE IF EXISTS timesheets;
DROP TABLE IF EXISTS expense_claims;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS performance_reviews;
DROP TABLE IF EXISTS interview_schedules;
DROP TABLE IF EXISTS applicants;
DROP TABLE IF EXISTS job_openings;
DROP TABLE IF EXISTS company_posts;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS employee_compliance_status;
DROP TABLE IF EXISTS compliance_modules;
DROP TABLE IF EXISTS coaching_sessions;
DROP TABLE IF EXISTS maintenance_schedules;
DROP TABLE IF EXISTS production_lines;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;

-- Create Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  job_title VARCHAR(255),
  department_id UUID REFERENCES departments(id),
  manager_id UUID REFERENCES employees(id),
  hire_date DATE,
  status VARCHAR(50) DEFAULT 'Active', -- e.g., Active, Inactive, On Leave
  profile_picture_url TEXT,
  phone_number VARCHAR(50),
  emergency_contact JSONB,
  bio TEXT,
  skills JSONB,
  linkedin_profile VARCHAR(255),
  role VARCHAR(50) DEFAULT 'employee' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Job Openings table
CREATE TABLE IF NOT EXISTS job_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  status VARCHAR(50) DEFAULT 'Open', -- e.g., Open, Closed, On Hold
  posted_at TIMESTAMPTZ DEFAULT now(),
  salary_range JSONB,
  location VARCHAR(255),
  job_type VARCHAR(50),
  company_logo TEXT
);

-- Create Applicants table
CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  job_opening_id UUID REFERENCES job_openings(id),
  status VARCHAR(50) DEFAULT 'Applied', -- e.g., Applied, Screening, Interview, Offer, Hired, Rejected
  applied_at TIMESTAMPTZ DEFAULT now(),
  resume_url TEXT,
  profile_picture TEXT,
  linkedin_profile VARCHAR(255),
  skills JSONB
);

-- Create Company Posts table
CREATE TABLE IF NOT EXISTS company_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES employees(id),
  title VARCHAR(255),
  content TEXT,
  image_url TEXT,
  tags JSONB,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create IT Assets table
CREATE TABLE IF NOT EXISTS it_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_tag VARCHAR(255) UNIQUE NOT NULL,
    asset_type VARCHAR(100),
    model VARCHAR(255),
    status VARCHAR(50), -- e.g., Available, In Use, Maintenance, Retired
    purchase_date DATE,
    warranty_end_date DATE,
    image_url TEXT,
    serial_number VARCHAR(255),
    current_location VARCHAR(255)
);

-- Create Performance Reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  reviewer_id UUID REFERENCES employees(id),
  review_period VARCHAR(100),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  goals TEXT,
  achievements TEXT,
  areas_for_improvement TEXT,
  review_date TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and set up policies

-- Policies for departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Departments are viewable by all authenticated users." ON departments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage departments." ON departments
  FOR ALL USING (get_my_claim('user_role') = '"admin"');

-- Policies for employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees are viewable by everyone." ON employees
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own employee record." ON employees
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own employee record." ON employees
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins and HR can do anything." ON employees
  FOR ALL USING (get_my_claim('user_role') IN ('"admin"', '"hr"'));
CREATE POLICY "Managers can view their team members." ON employees
  FOR SELECT USING (manager_id = auth.uid());

-- Policies for job_openings
ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job openings are public." ON job_openings
  FOR SELECT USING (true);
CREATE POLICY "Recruiters, HR, and Admins can manage job openings." ON job_openings
  FOR ALL USING (get_my_claim('user_role') IN ('"recruiter"', '"hr"', '"admin"'));

-- Policies for applicants
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters, HR, and Admins can manage applicants." ON applicants
  FOR ALL USING (get_my_claim('user_role') IN ('"recruiter"', '"hr"', '"admin"'));

-- Policies for company_posts
ALTER TABLE company_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company posts are viewable by everyone." ON company_posts
  FOR SELECT USING (true);
CREATE POLICY "Admins and HR can create company posts." ON company_posts
  FOR INSERT WITH CHECK (get_my_claim('user_role') IN ('"admin"', '"hr"'));

-- Policies for it_assets
ALTER TABLE it_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "IT assets are viewable by all employees." ON it_assets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "IT Managers and Admins can manage assets." ON it_assets
  FOR ALL USING (get_my_claim('user_role') IN ('"it-manager"', '"admin"'));

-- Policies for performance_reviews
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees can view their own reviews." ON performance_reviews
  FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Managers can view their team's reviews." ON performance_reviews
  FOR SELECT USING (reviewer_id = auth.uid());
CREATE POLICY "HR and Admins can manage all reviews." ON performance_reviews
  FOR ALL USING (get_my_claim('user_role') IN ('"hr"', '"admin"'));


-- Helper function to get custom claims
create or replace function get_my_claim(claim TEXT) returns jsonb as $$
    select nullif(current_setting('request.jwt.claims', true), '')::jsonb->'app_metadata'->claim
$$ language sql stable;
