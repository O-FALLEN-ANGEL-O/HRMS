-- Drop tables in reverse order of creation to handle dependencies, using CASCADE
DROP TABLE IF EXISTS helpdesk_messages CASCADE;
DROP TABLE IF EXISTS helpdesk_tickets CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS assessment_answers CASCADE;
DROP TABLE IF EXISTS assessment_attempts CASCADE;
DROP TABLE IF EXISTS assessment_questions CASCADE;
DROP TABLE IF EXISTS assessment_sections CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS asset_assignments CASCADE;
DROP TABLE IF EXISTS it_assets CASCADE;
DROP TABLE IF EXISTS software_licenses CASCADE;
DROP TABLE IF EXISTS employee_tasks CASCADE;
DROP TABLE IF EXISTS onboarding_tasks CASCADE;
DROP TABLE IF EXISTS payroll_records CASCADE;
DROP TABLE IF EXISTS payslips CASCADE;
DROP TABLE IF EXISTS expense_claims CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS timesheets CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS performance_reviews CASCADE;
DROP TABLE IF EXISTS interview_schedules CASCADE;
DROP TABLE IF EXISTS applicants CASCADE;
DROP TABLE IF EXISTS job_openings CASCADE;
DROP TABLE IF EXISTS company_posts CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS weekly_award_stats CASCADE;
DROP TABLE IF EXISTS employee_awards CASCADE;
DROP TABLE IF EXISTS employee_compliance_status CASCADE;
DROP TABLE IF EXISTS compliance_modules CASCADE;
DROP TABLE IF EXISTS coaching_sessions CASCADE;
DROP TABLE IF EXISTS access_requests CASCADE;
DROP TABLE IF EXISTS maintenance_schedules CASCADE;
DROP TABLE IF EXISTS production_lines CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin full access" ON departments FOR ALL TO service_role USING (true);


-- Create Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY, -- References auth.users(id)
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    job_title VARCHAR(255),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL, -- Self-referencing
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'Active', -- e.g., Active, Inactive, On Leave
    profile_picture_url TEXT,
    phone_number VARCHAR(50),
    emergency_contact JSONB,
    bio TEXT,
    skills JSONB,
    linkedin_profile VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- e.g., admin, hr, manager, employee
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_auth_user FOREIGN KEY(id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read their own profile" ON employees FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow managers to read their team's profiles" ON employees FOR SELECT USING (department_id IN (SELECT department_id FROM employees WHERE id = auth.uid()));
CREATE POLICY "Allow HR/Admin to read all profiles" ON employees FOR SELECT USING (get_my_claim('user_role') IN ('admin', 'hr'));
CREATE POLICY "Allow users to update their own profile" ON employees FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow user to insert their own profile" ON employees FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow admin full access" ON employees FOR ALL TO service_role USING (true);


-- Create Leave Balances Table
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- e.g., Sick, Casual, PTO
    balance INT NOT NULL DEFAULT 0,
    UNIQUE(employee_id, leave_type)
);
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user to see own balances" ON leave_balances FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Allow admin full access" ON leave_balances FOR ALL TO service_role USING (true);


-- Create Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending', -- e.g., Pending, Approved, Rejected
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user to manage own requests" ON leave_requests FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Allow manager to see team requests" ON leave_requests FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE manager_id = auth.uid()));
CREATE POLICY "Allow HR/Admin full access" ON leave_requests FOR ALL USING (get_my_claim('user_role') IN ('admin', 'hr'));
CREATE POLICY "Allow admin service role" ON leave_requests FOR ALL TO service_role USING(true);


-- Create Company Posts (Social Feed) Table
CREATE TABLE IF NOT EXISTS company_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE company_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON company_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow HR/Admin to create posts" ON company_posts FOR INSERT TO authenticated WITH CHECK (get_my_claim('user_role') IN ('admin', 'hr'));
CREATE POLICY "Allow admin service role" ON company_posts FOR ALL TO service_role USING(true);


-- Create Job Openings Table
CREATE TABLE IF NOT EXISTS job_openings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Open', -- e.g., Open, Closed, On Hold
    created_at TIMESTAMPTZ DEFAULT NOW(),
    company_logo TEXT
);
ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON job_openings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow HR/Recruiter/Admin to manage" ON job_openings FOR ALL USING (get_my_claim('user_role') IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Allow admin service role" ON job_openings FOR ALL TO service_role USING(true);


-- Create Applicants Table
CREATE TABLE IF NOT EXISTS applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    resume_url TEXT,
    status VARCHAR(50) DEFAULT 'Applied', -- e.g., Applied, Screening, Interview, Offer, Hired, Rejected
    job_opening_id UUID REFERENCES job_openings(id) ON DELETE CASCADE,
    application_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    profile_picture TEXT
);
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow HR/Recruiter/Admin to manage" ON applicants FOR ALL USING (get_my_claim('user_role') IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Allow admin service role" ON applicants FOR ALL TO service_role USING(true);


-- Create Interview Schedules Table
CREATE TABLE IF NOT EXISTS interview_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    interview_date TIMESTAMPTZ NOT NULL,
    interview_type VARCHAR(100), -- e.g., Phone Screen, Technical, Final
    notes TEXT
);
ALTER TABLE interview_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow involved parties to view" ON interview_schedules FOR SELECT USING (auth.uid() = interviewer_id OR get_my_claim('user_role') IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Allow HR/Recruiter/Admin to manage" ON interview_schedules FOR ALL USING (get_my_claim('user_role') IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Allow admin service role" ON interview_schedules FOR ALL TO service_role USING(true);


-- Create Performance Reviews Table
CREATE TABLE IF NOT EXISTS performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_date DATE DEFAULT CURRENT_DATE,
    review_period VARCHAR(100), -- e.g., Q1 2024
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    goals TEXT
);
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user to see own reviews" ON performance_reviews FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Allow manager/HR/Admin to manage" ON performance_reviews FOR ALL USING (employee_id IN (SELECT id FROM employees WHERE manager_id = auth.uid()) OR get_my_claim('user_role') IN ('admin', 'hr', 'manager'));
CREATE POLICY "Allow admin service role" ON performance_reviews FOR ALL TO service_role USING(true);


-- Create Payslips Table
CREATE TABLE IF NOT EXISTS payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    gross_salary NUMERIC(10, 2) NOT NULL,
    deductions JSONB,
    net_salary NUMERIC(10, 2) NOT NULL,
    file_url TEXT
);
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user to see own payslips" ON payslips FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Allow Finance/Admin to manage" ON payslips FOR ALL USING (get_my_claim('user_role') IN ('admin', 'finance'));
CREATE POLICY "Allow admin service role" ON payslips FOR ALL TO service_role USING(true);


-- Create IT Assets Table
CREATE TABLE IF NOT EXISTS it_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_tag VARCHAR(100) UNIQUE NOT NULL,
    asset_type VARCHAR(100), -- e.g., Laptop, Monitor, Phone
    model VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Available', -- e.g., Available, Assigned, In Repair, Retired
    purchase_date DATE,
    warranty_end_date DATE,
    image_url TEXT
);
ALTER TABLE it_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow IT/Admin to manage" ON it_assets FOR ALL USING (get_my_claim('user_role') IN ('admin', 'it-manager'));
CREATE POLICY "Allow admin service role" ON it_assets FOR ALL TO service_role USING(true);


-- Create Asset Assignments Table
CREATE TABLE IF NOT EXISTS asset_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES it_assets(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    returned_date DATE,
    UNIQUE(asset_id, employee_id, assigned_date)
);
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user to see own assignments" ON asset_assignments FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Allow IT/Admin to manage" ON asset_assignments FOR ALL USING (get_my_claim('user_role') IN ('admin', 'it-manager'));
CREATE POLICY "Allow admin service role" ON asset_assignments FOR ALL TO service_role USING(true);


-- Create Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    process_type VARCHAR(255),
    duration INT,
    passing_score INT,
    created_by_id UUID REFERENCES employees(id) ON DELETE SET NULL
);
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow HR/Admin/Recruiter to manage" ON assessments FOR ALL USING (get_my_claim('user_role') IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Allow admin service role" ON assessments FOR ALL TO service_role USING(true);


-- Create Helpdesk Tickets Table
CREATE TABLE IF NOT EXISTS helpdesk_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- e.g., IT, HR, Finance
    priority VARCHAR(50), -- e.g., Low, Medium, High
    status VARCHAR(50) DEFAULT 'Open',
    assigned_to_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
ALTER TABLE helpdesk_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user to manage own tickets" ON helpdesk_tickets FOR ALL USING (auth.uid() = requester_id);
CREATE POLICY "Allow IT/HR/Admin to manage" ON helpdesk_tickets FOR ALL USING (get_my_claim('user_role') IN ('admin', 'it-manager', 'hr'));
CREATE POLICY "Allow admin service role" ON helpdesk_tickets FOR ALL TO service_role USING(true);


-- Create Helpdesk Messages Table
CREATE TABLE IF NOT EXISTS helpdesk_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE helpdesk_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow ticket members to access messages" ON helpdesk_messages FOR ALL USING (ticket_id IN (SELECT id FROM helpdesk_tickets WHERE requester_id = auth.uid()) OR get_my_claim('user_role') IN ('admin', 'it-manager', 'hr'));
CREATE POLICY "Allow admin service role" ON helpdesk_messages FOR ALL TO service_role USING(true);

-- Create Employee Awards Table
CREATE TABLE IF NOT EXISTS employee_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receiver_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    giver_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    award_type VARCHAR(100), -- e.g., 'Employee of the Month', 'Spot Award'
    points INT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE employee_awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to see their own awards" ON employee_awards FOR SELECT USING (auth.uid() = receiver_id);
CREATE POLICY "Allow managers/HR/Admin to give awards" ON employee_awards FOR ALL USING (get_my_claim('user_role') IN ('admin', 'hr', 'manager'));
CREATE POLICY "Allow admin service role" ON employee_awards FOR ALL TO service_role USING(true);


-- Create Weekly Award Stats Table (example of analytics table)
CREATE TABLE IF NOT EXISTS weekly_award_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    awards_received INT DEFAULT 0,
    points_earned INT DEFAULT 0,
    UNIQUE(employee_id, week_start_date)
);
ALTER TABLE weekly_award_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to see their own stats" ON weekly_award_stats FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Allow HR/Admin to manage" ON weekly_award_stats FOR ALL USING (get_my_claim('user_role') IN ('admin', 'hr'));
CREATE POLICY "Allow admin service role" ON weekly_award_stats FOR ALL TO service_role USING(true);
