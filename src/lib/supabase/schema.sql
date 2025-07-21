-- HR+ (OptiTalent) Supabase Schema
-- This script defines all tables, relationships, and RLS policies.

-- ----------------------------------------------------------------
-- 1. Helper Functions & Custom Types
-- ----------------------------------------------------------------

-- Custom type for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'hr', 'manager', 'employee', 'recruiter', 'qa-analyst', 'process-manager', 'team-leader', 'marketing', 'finance', 'it-manager', 'operations-manager');

-- Function to get the current user's UID from Supabase auth
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$ LANGUAGE sql STABLE;

-- Function to get the current user's role from the users table
CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS app_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Function to check if a user is part of another user's team (i.e., reports to them)
CREATE OR REPLACE FUNCTION public.is_my_team_member(user_id uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND manager_id = auth.uid()
  );
$$ LANGUAGE sql STABLE;


-- ----------------------------------------------------------------
-- 2. Tables Definition
-- ----------------------------------------------------------------

-- Users Table: Central repository for all users.
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE,
  full_name TEXT,
  email TEXT UNIQUE,
  role app_role NOT NULL DEFAULT 'employee',
  department TEXT,
  job_title TEXT,
  profile_picture_url TEXT,
  manager_id uuid REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.users IS 'Stores user profile and role information.';

-- Job Postings Table
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Open', -- e.g., Open, Closed, Archived
  created_by uuid NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.jobs IS 'Stores job postings for recruitment.';

-- Applicants Table
CREATE TABLE public.applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'Applied', -- Applied, Screening, Interview, Offer, Hired, Rejected
  job_id uuid REFERENCES public.jobs(id),
  resume_url TEXT,
  parsed_resume_data JSONB,
  match_score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.applicants IS 'Stores information about job applicants.';

-- Applicant Notes Table
CREATE TABLE public.applicant_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.applicant_notes IS 'Internal notes on applicants by the hiring team.';

-- Leave Requests Table
CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  leave_type TEXT NOT NULL, -- Sick, Casual, PTO
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected
  approved_by uuid REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.leave_requests IS 'Stores all employee leave requests.';

-- Attendance Table
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  check_in_time TIMESTAMPTZ NOT NULL,
  check_out_time TIMESTAMPTZ,
  duration_hours NUMERIC,
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.attendance IS 'Records employee check-in and check-out times.';

-- Company Feed/Posts Table
CREATE TABLE public.company_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.company_posts IS 'Stores posts for the company feed.';

-- Helpdesk Tickets Table
CREATE TABLE public.helpdesk_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- IT, HR, Finance
  priority TEXT NOT NULL DEFAULT 'Medium', -- Low, Medium, High
  status TEXT NOT NULL DEFAULT 'Open', -- Open, In Progress, Closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.helpdesk_tickets IS 'Stores employee support tickets.';

-- Ticket Comments Table
CREATE TABLE public.ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.ticket_comments IS 'Comments on helpdesk tickets.';


-- ----------------------------------------------------------------
-- 3. Row-Level Security (RLS) Policies
-- ----------------------------------------------------------------

-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;


-- --- Users Table Policies ---
-- Users can view their own profile.
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (id = auth.uid());
-- Users can update their own profile.
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (id = auth.uid());
-- HR, Admins, and Managers can view profiles. Managers can only see their team.
CREATE POLICY "Admins, HR and Managers can view user profiles" ON public.users FOR SELECT USING (
  get_my_role() IN ('admin', 'hr') OR
  (get_my_role() = 'manager' AND is_my_team_member(id))
);
-- HR and Admins can create and update any user profile.
CREATE POLICY "Admins and HR can manage user profiles" ON public.users FOR ALL USING (get_my_role() IN ('admin', 'hr'));


-- --- Leave Requests Table Policies ---
-- Employees can see their own leave requests.
CREATE POLICY "Employees can view their own leave requests" ON public.leave_requests FOR SELECT USING (user_id = auth.uid());
-- Employees can create their own leave requests.
CREATE POLICY "Employees can create leave requests for themselves" ON public.leave_requests FOR INSERT WITH CHECK (user_id = auth.uid());
-- Managers can view their team's leave requests.
CREATE POLICY "Managers can view their team's leave requests" ON public.leave_requests FOR SELECT USING (is_my_team_member(user_id));
-- Managers can approve/reject their team's leave requests.
CREATE POLICY "Managers can update their team's leave requests" ON public.leave_requests FOR UPDATE USING (is_my_team_member(user_id));
-- Admins and HR can manage all leave requests.
CREATE POLICY "Admins and HR can manage all leave requests" ON public.leave_requests FOR ALL USING (get_my_role() IN ('admin', 'hr'));


-- --- Attendance Table Policies ---
-- Employees can manage their own attendance records.
CREATE POLICY "Employees can manage own attendance" ON public.attendance FOR ALL USING (user_id = auth.uid());
-- Managers can view their team's attendance.
CREATE POLICY "Managers can view team attendance" ON public.attendance FOR SELECT USING (is_my_team_member(user_id));
-- Admins and HR can manage all attendance records.
CREATE POLICY "Admins and HR can manage all attendance" ON public.attendance FOR ALL USING (get_my_role() IN ('admin', 'hr'));


-- --- Recruitment-related Tables Policies (Jobs, Applicants, Notes) ---
-- All authenticated users can view job postings.
CREATE POLICY "All users can view jobs" ON public.jobs FOR SELECT USING (true);
-- Recruiters, HR, and Admins can manage all recruitment data.
CREATE POLICY "Recruitment team can manage jobs" ON public.jobs FOR ALL USING (get_my_role() IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Recruitment team can manage applicants" ON public.applicants FOR ALL USING (get_my_role() IN ('admin', 'hr', 'recruiter'));
CREATE POLICY "Hiring team can manage applicant notes" ON public.applicant_notes FOR ALL USING (get_my_role() IN ('admin', 'hr', 'recruiter', 'manager'));


-- --- General Access Tables (Company Feed, Helpdesk) ---
-- All authenticated users can view the company feed.
CREATE POLICY "All users can view company feed" ON public.company_posts FOR SELECT USING (true);
-- HR and Admins can create company posts.
CREATE POLICY "Admins and HR can create posts" ON public.company_posts FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'hr'));
-- All users can manage their own tickets.
CREATE POLICY "Users can manage their own tickets" ON public.helpdesk_tickets FOR ALL USING (user_id = auth.uid());
-- IT, HR, and Admins can view all tickets.
CREATE POLICY "Support staff can view all tickets" ON public.helpdesk_tickets FOR SELECT USING (get_my_role() IN ('admin', 'hr', 'it-manager'));
-- Authenticated users can comment on tickets they have access to.
CREATE POLICY "Users can comment on accessible tickets" ON public.ticket_comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.helpdesk_tickets
      WHERE id = ticket_id -- This implicitly uses the RLS from helpdesk_tickets
    )
  );

-- ----------------------------------------------------------------
-- 4. Enable Real-time Updates (Publications)
-- ----------------------------------------------------------------

-- Create publications for real-time features
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- Specifically enable real-time on key tables.
-- Supabase Studio UI is often easier for this, but here is the SQL way.
-- This tells Supabase to broadcast changes on these tables.
-- Assuming the publication 'supabase_realtime' is what your Supabase project uses.

ALTER PUBLICATION supabase_realtime ADD TABLE public.company_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.helpdesk_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;


-- ----------------------------------------------------------------
-- 5. Indexes for Performance
-- ----------------------------------------------------------------

CREATE INDEX idx_users_manager_id ON public.users(manager_id);
CREATE INDEX idx_leave_requests_user_id ON public.leave_requests(user_id);
CREATE INDEX idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX idx_helpdesk_tickets_user_id ON public.helpdesk_tickets(user_id);
CREATE INDEX idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);
