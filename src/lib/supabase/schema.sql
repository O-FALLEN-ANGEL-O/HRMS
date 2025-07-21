-- -------------------------------------------------------------------------------------------------
-- Users, Roles, and Profiles
-- -------------------------------------------------------------------------------------------------

-- Enum for user roles
create type public.user_role as enum (
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
  'operations-manager',
  'guest'
);

-- Profiles table to store public user data
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'guest',
  employee_id text unique,
  department text,
  job_title text,
  manager_id uuid references public.profiles(id)
);

-- Function to get the current user's role
create or replace function public.get_my_role()
returns public.user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable;

-- Function to check if a user is a manager of another user
create or replace function public.is_manager_of(employee_uuid uuid)
returns boolean as $$
  select exists(
    select 1 from public.profiles
    where id = employee_uuid and manager_id = auth.uid()
  );
$$ language sql stable;

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Managers can view their team members' profiles" on public.profiles
  for select using (public.is_manager_of(id));
  
create policy "HR/Admin can view all profiles" on public.profiles
  for select using (public.get_my_role() in ('hr', 'admin'));

create policy "HR/Admin can create profiles" on public.profiles
  for insert with check (public.get_my_role() in ('hr', 'admin'));
  
create policy "HR/Admin can update any profile" on public.profiles
  for update using (public.get_my_role() in ('hr', 'admin'));

-- -------------------------------------------------------------------------------------------------
-- Recruitment
-- -------------------------------------------------------------------------------------------------

-- Enum for applicant status
create type public.applicant_status as enum ('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected');

-- Applicants table
create table public.applicants (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null unique,
  role_applied text not null,
  status public.applicant_status not null default 'Applied',
  application_date date not null default current_date,
  resume_url text,
  parsed_resume_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Interviewer Notes table
create table public.interviewer_notes (
  id uuid primary key default uuid_generate_v4(),
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  interviewer_id uuid not null references public.profiles(id),
  note text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.applicants enable row level security;
alter table public.interviewer_notes enable row level security;

-- Policies for recruitment
create policy "HR/Recruiters/Admins can manage applicants" on public.applicants
  for all using (public.get_my_role() in ('hr', 'recruiter', 'admin'));
  
create policy "HR/Recruiters/Admins/Managers can manage interviewer notes" on public.interviewer_notes
  for all using (public.get_my_role() in ('hr', 'recruiter', 'admin', 'manager'));
  
-- Enable real-time for recruitment changes
alter publication supabase_realtime add table public.applicants, public.interviewer_notes;


-- -------------------------------------------------------------------------------------------------
-- Leave Management
-- -------------------------------------------------------------------------------------------------
create type public.leave_type as enum ('Sick Leave', 'Casual Leave', 'Paid Time Off', 'Work From Home');
create type public.leave_status as enum ('Pending', 'Approved', 'Rejected');

create table public.leave_requests (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.profiles(id),
  leave_type public.leave_type not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status public.leave_status not null default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.leave_requests enable row level security;

create policy "Employees can manage their own leave requests" on public.leave_requests
  for all using (auth.uid() = employee_id);
  
create policy "Managers can view and approve/reject their team's leave requests" on public.leave_requests
  for all using (public.is_manager_of(employee_id));

create policy "HR/Admins can manage all leave requests" on public.leave_requests
  for all using (public.get_my_role() in ('hr', 'admin'));

-- -------------------------------------------------------------------------------------------------
-- Helpdesk / Ticketing
-- -------------------------------------------------------------------------------------------------
create type public.ticket_category as enum ('IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry');
create type public.ticket_priority as enum ('Low', 'Medium', 'High');
create type public.ticket_status as enum ('Open', 'In Progress', 'Closed');

create table public.helpdesk_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id),
  subject text not null,
  category public.ticket_category,
  priority public.ticket_priority,
  status public.ticket_status not null default 'Open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.ticket_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references public.helpdesk_tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.helpdesk_tickets enable row level security;
alter table public.ticket_messages enable row level security;

create policy "Users can manage their own tickets" on public.helpdesk_tickets
  for all using (auth.uid() = user_id);

create policy "Users can manage messages on their own tickets" on public.ticket_messages
  for all using (ticket_id in (select id from public.helpdesk_tickets where user_id = auth.uid()));

create policy "Support staff can manage all tickets and messages" on public.helpdesk_tickets
  for all using (public.get_my_role() in ('admin', 'hr', 'it-manager'));

create policy "Support staff can manage all messages" on public.ticket_messages
  for all using (public.get_my_role() in ('admin', 'hr', 'it-manager'));

-- Enable real-time for helpdesk
alter publication supabase_realtime add table public.helpdesk_tickets, public.ticket_messages;


-- -------------------------------------------------------------------------------------------------
-- Company Feed
-- -------------------------------------------------------------------------------------------------
create table public.company_posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles(id),
  title text not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.company_posts enable row level security;

create policy "All users can view company posts" on public.company_posts
  for select using (true);
  
create policy "HR/Admins can create and manage posts" on public.company_posts
  for all using (public.get_my_role() in ('hr', 'admin'));
  
-- Enable real-time for feed
alter publication supabase_realtime add table public.company_posts;

-- -------------------------------------------------------------------------------------------------
-- Assessments
-- -------------------------------------------------------------------------------------------------

create type public.assessment_question_type as enum ('mcq', 'typing', 'audio', 'voice_input', 'video_input');
create type public.assessment_process_type as enum ('Chat Support', 'Voice Process – English', 'Voice Process – Kannada', 'Technical Support', 'IT / Developer Role');

create table public.assessments (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  process_type public.assessment_process_type not null,
  duration_minutes integer not null,
  passing_score integer not null,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.assessment_sections (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  title text not null,
  time_limit_minutes integer not null,
  section_order integer
);

create table public.assessment_questions (
  id uuid primary key default uuid_generate_v4(),
  section_id uuid not null references public.assessment_sections(id) on delete cascade,
  question_text text not null,
  question_type public.assessment_question_type not null,
  options jsonb, -- For MCQ options
  correct_answer text,
  typing_prompt text,
  audio_prompt_url text,
  question_order integer
);

create table public.assessment_attempts (
    id uuid primary key default uuid_generate_v4(),
    assessment_id uuid not null references public.assessments(id) on delete cascade,
    user_id uuid not null references public.profiles(id),
    status text not null default 'in_progress', -- e.g., in_progress, completed
    score integer,
    started_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone
);

create table public.assessment_answers (
    id uuid primary key default uuid_generate_v4(),
    attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
    question_id uuid not null references public.assessment_questions(id) on delete cascade,
    answer_text text,
    is_correct boolean
);


alter table public.assessments enable row level security;
alter table public.assessment_sections enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assessment_answers enable row level security;

-- Policies for Assessments
create policy "HR/Admin/Recruiters can manage assessments" on public.assessments
  for all using (public.get_my_role() in ('hr', 'admin', 'recruiter'));

create policy "HR/Admin/Recruiters can manage assessment sections" on public.assessment_sections
  for all using (public.get_my_role() in ('hr', 'admin', 'recruiter'));

create policy "HR/Admin/Recruiters can manage assessment questions" on public.assessment_questions
  for all using (public.get_my_role() in ('hr', 'admin', 'recruiter'));
  
create policy "Authenticated users can view assigned assessments" on public.assessments
  for select using (true); -- In a real app, you'd link this to an assignment table

create policy "Users can manage their own assessment attempts and answers" on public.assessment_attempts
  for all using (auth.uid() = user_id);
  
create policy "Users can manage their own answers" on public.assessment_answers
  for all using (attempt_id in (select id from public.assessment_attempts where user_id = auth.uid()));
  
create policy "HR/Admin/Recruiters can view all attempts and answers" on public.assessment_attempts
  for select using (public.get_my_role() in ('hr', 'admin', 'recruiter'));

create policy "HR/Admin/Recruiters can view all answers" on public.assessment_answers
  for select using (public.get_my_role() in ('hr', 'admin', 'recruiter'));
  
-- -------------------------------------------------------------------------------------------------
-- Payroll & Onboarding
-- -------------------------------------------------------------------------------------------------

create table public.payslips (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.profiles(id),
  period_start date not null,
  period_end date not null,
  data jsonb,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.onboarding_tasks (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text
);

create table public.employee_tasks (
    id uuid primary key default uuid_generate_v4(),
    employee_id uuid not null references public.profiles(id),
    task_id uuid not null references public.onboarding_tasks(id),
    is_completed boolean not null default false,
    completed_at timestamp with time zone
);

alter table public.payslips enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.employee_tasks enable row level security;

-- Policies
create policy "Employees can view their own payslips" on public.payslips
  for select using (auth.uid() = employee_id);
  
create policy "Finance/HR/Admins can manage all payslips" on public.payslips
  for all using (public.get_my_role() in ('finance', 'hr', 'admin'));
  
create policy "Employees can view their own tasks" on public.employee_tasks
  for select using (auth.uid() = employee_id);

create policy "HR/Admins can manage all tasks" on public.onboarding_tasks
  for all using (public.get_my_role() in ('hr', 'admin'));
  
create policy "HR/Admins/Managers can manage employee tasks" on public.employee_tasks
  for all using (public.get_my_role() in ('hr', 'admin') or public.is_manager_of(employee_id));
