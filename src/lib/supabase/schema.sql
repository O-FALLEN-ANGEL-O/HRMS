-- ------------------------------------------------------------------------------------
-- 1. Create custom types
-- ------------------------------------------------------------------------------------

-- Custom type for user roles
create type public.user_roles as enum (
  'admin',
  'hr',
  'manager',
  'recruiter',
  'employee',
  'trainee',
  'qa-analyst',
  'process-manager',
  'team-leader',
  'marketing',
  'finance',
  'it-manager',
  'operations-manager',
  'account-manager',
  'trainer'
);

-- Custom type for leave request status
create type public.leave_status as enum ('Pending', 'Approved', 'Rejected');

-- Custom type for leave types
create type public.leave_type as enum ('Sick Leave', 'Casual Leave', 'Paid Time Off', 'Work From Home');

-- Custom type for ticket status
create type public.ticket_status as enum ('Open', 'In Progress', 'Closed');

-- Custom type for ticket priority
create type public.ticket_priority as enum ('Low', 'Medium', 'High');

-- Custom type for ticket category
create type public.ticket_category as enum ('IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry');

-- Custom type for assessment types
create type public.assessment_type as enum ('mcq', 'typing', 'audio', 'voice_input', 'video_input', 'simulation');


-- ------------------------------------------------------------------------------------
-- 2. Create tables
-- ------------------------------------------------------------------------------------

-- Departments table
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.departments is 'Stores company departments.';

-- Users table, links to auth.users
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  role public.user_roles default 'employee'::public.user_roles not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.users is 'Profile data for each user.';

-- Employees table, contains profile information
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users (id) on delete cascade not null,
  full_name text not null,
  job_title text not null,
  employee_id text unique not null,
  department_id uuid references public.departments (id) on delete set null,
  manager_id uuid references public.employees (id) on delete set null,
  phone_number text,
  profile_picture_url text,
  status text default 'Active'::text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.employees is 'Stores detailed employee profile information.';

-- Leave Requests table
create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees (id) on delete cascade not null,
  leave_type public.leave_type not null,
  start_date date not null,
  end_date date not null,
  days integer not null,
  reason text,
  status public.leave_status default 'Pending'::public.leave_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.leave_requests is 'Stores employee leave requests.';

-- Helpdesk Tickets table
create table public.helpdesk_tickets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    subject text not null,
    description text not null,
    status public.ticket_status default 'Open'::public.ticket_status not null,
    priority public.ticket_priority not null,
    category public.ticket_category not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.helpdesk_tickets is 'Stores support tickets submitted by users.';

-- Ticket Messages table
create table public.helpdesk_ticket_messages (
    id uuid primary key default gen_random_uuid(),
    ticket_id uuid references public.helpdesk_tickets(id) on delete cascade not null,
    user_id uuid references public.users(id) on delete cascade not null,
    from_type text not null check (from_type in ('user', 'support', 'system')),
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.helpdesk_ticket_messages is 'Stores messages for each helpdesk ticket.';

-- Company Feed Posts table
create table public.company_feed_posts (
    id uuid primary key default gen_random_uuid(),
    author_id uuid references public.users(id) on delete cascade not null,
    title text not null,
    content text not null,
    likes integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.company_feed_posts is 'Stores posts for the company feed.';

-- Assessments table
create table public.assessments (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    process_type text not null,
    duration integer not null, -- in minutes
    passing_score integer not null,
    max_attempts integer default 1 not null,
    created_by uuid references public.users(id) on delete set null
);
comment on table public.assessments is 'Defines available assessments.';

-- Assessment Attempts table
create table public.assessment_attempts (
    id uuid primary key default gen_random_uuid(),
    assessment_id uuid references public.assessments(id) on delete cascade not null,
    user_id uuid references public.users(id) on delete cascade not null,
    score integer,
    status text not null check (status in ('Not Started', 'In Progress', 'Completed')),
    started_at timestamp with time zone,
    completed_at timestamp with time zone
);
comment on table public.assessment_attempts is 'Tracks user attempts at assessments.';

-- ------------------------------------------------------------------------------------
-- 3. Create functions
-- ------------------------------------------------------------------------------------

-- Function to create a public user profile when a new auth user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Trigger to call the function on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ------------------------------------------------------------------------------------
-- 4. Enable Row Level Security (RLS)
-- ------------------------------------------------------------------------------------
alter table public.departments enable row level security;
alter table public.users enable row level security;
alter table public.employees enable row level security;
alter table public.leave_requests enable row level security;
alter table public.helpdesk_tickets enable row level security;
alter table public.helpdesk_ticket_messages enable row level security;
alter table public.company_feed_posts enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_attempts enable row level security;


-- ------------------------------------------------------------------------------------
-- 5. Define RLS Policies
-- ------------------------------------------------------------------------------------

-- Policies for `departments` table
create policy "Authenticated users can read departments" on public.departments
  for select using (auth.role() = 'authenticated');
create policy "Admins and HR can manage departments" on public.departments
  for all using (auth.uid() in (select id from public.users where role in ('admin', 'hr')));

-- Policies for `users` table
create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);
create policy "Admins and HR can view all users" on public.users
  for select using (auth.uid() in (select id from public.users where role in ('admin', 'hr')));

-- Policies for `employees` table
create policy "Employees can view their own profile" on public.employees
  for select using (auth.uid() = user_id);
create policy "Employees can view profiles of others (read-only)" on public.employees
  for select using (auth.role() = 'authenticated');
create policy "Admins and HR can manage all employee profiles" on public.employees
  for all using (auth.uid() in (select id from public.users where role in ('admin', 'hr')));
create policy "Managers can view their direct reports" on public.employees
  for select using (manager_id = (select id from public.employees where user_id = auth.uid()));

-- Policies for `leave_requests` table
create policy "Employees can manage their own leave requests" on public.leave_requests
  for all using (employee_id = (select id from public.employees where user_id = auth.uid()));
create policy "Managers can view leave requests of their reports" on public.leave_requests
  for select using ((select department_id from public.employees where id = employee_id) in 
    (select department_id from public.employees where user_id = auth.uid()));
create policy "Admins and HR can manage all leave requests" on public.leave_requests
  for all using (auth.uid() in (select id from public.users where role in ('admin', 'hr')));

-- Policies for `helpdesk_tickets` table
create policy "Users can manage their own helpdesk tickets" on public.helpdesk_tickets
  for all using (auth.uid() = user_id);
create policy "IT and HR can view all tickets" on public.helpdesk_tickets
  for select using (auth.uid() in (select id from public.users where role in ('it-manager', 'hr', 'admin')));

-- Policies for `company_feed_posts` table
create policy "Authenticated users can read posts" on public.company_feed_posts
  for select using (auth.role() = 'authenticated');
create policy "Admins and HR can create posts" on public.company_feed_posts
  for insert with check (auth.uid() in (select id from public.users where role in ('admin', 'hr')));
  
-- Policies for `assessments` and `assessment_attempts`
create policy "Authenticated users can view assessments" on public.assessments
    for select using (auth.role() = 'authenticated');
create policy "HR and trainers can manage assessments" on public.assessments
    for all using (auth.uid() in (select id from public.users where role in ('hr', 'trainer', 'admin')));
create policy "Users can manage their own attempts" on public.assessment_attempts
    for all using (auth.uid() = user_id);
create policy "HR and trainers can view all attempts" on public.assessment_attempts
    for select using (auth.uid() in (select id from public.users where role in ('hr', 'trainer', 'admin')));


-- ------------------------------------------------------------------------------------
-- 6. Insert Seed Data
-- ------------------------------------------------------------------------------------

-- Insert Departments
insert into public.departments (name) values
  ('Administration'), ('Human Resources'), ('Engineering'),
  ('Quality Assurance'), ('Process Excellence'), ('Customer Support'),
  ('Marketing'), ('Finance'), ('IT'), ('Operations'), ('Client Services'),
  ('Learning & Development');

-- The rest of the seed data will be added automatically when a user signs up.
-- You can add specific users and employees here if you need to pre-populate the database for testing.
-- Example of adding a user and employee record:

-- -- Step 1: Create an auth user in the Supabase Dashboard (Authentication -> Users)
-- -- Note down the user's UID. Let's assume it's '8d1f7c8e-8a2c-4b5a-9a9a-1b1c3d4e5f6a'

-- -- Step 2: Insert into public.users and public.employees using the UID
-- with dept as (select id from public.departments where name = 'Engineering')
-- insert into public.users (id, email, role)
-- values ('8d1f7c8e-8a2c-4b5a-9a9a-1b1c3d4e5f6a', 'test.manager@example.com', 'manager');

-- with usr as (select id from public.users where email = 'test.manager@example.com'),
--      dept as (select id from public.departments where name = 'Engineering')
-- insert into public.employees (user_id, full_name, job_title, employee_id, department_id)
-- values ((select id from usr), 'Test Manager', 'Engineering Manager', 'PEPTEST1', (select id from dept));

-- You would repeat this for all the roles you want to pre-populate.
-- The current setup will create a basic user record on signup, which can then be updated.

-- The following is an example based on the mock data. You MUST create these users
-- in the Supabase Auth dashboard first and then replace the UUIDs below.

-- -- Assuming you've created users in Supabase Auth and have their UUIDs:
-- with admin_user as (
--   insert into public.users (id, email, role)
--   values ('<admin_uuid_here>', 'admin@optitalent.com', 'admin') returning id
-- ),
-- admin_dept as (
--   select id from public.departments where name = 'Administration'
-- )
-- insert into public.employees (user_id, full_name, job_title, employee_id, department_id)
-- select id, 'Admin User', 'System Administrator', 'PEP0001', (select id from admin_dept) from admin_user;

-- with hr_user as (
--   insert into public.users (id, email, role)
--   values ('<hr_uuid_here>', 'hr@optitalent.com', 'hr') returning id
-- ),
-- hr_dept as (
--   select id from public.departments where name = 'Human Resources'
-- )
-- insert into public.employees (user_id, full_name, job_title, employee_id, department_id)
-- select id, 'Jackson Lee', 'HR Manager', 'PEP0002', (select id from hr_dept) from hr_user;

-- -- etc. for all other roles...
```