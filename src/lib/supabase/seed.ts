
/**
 * -----------------------------------------------------------------------------
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! WARNING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * -----------------------------------------------------------------------------
 * THIS SCRIPT IS DESTRUCTIVE AND WILL ERASE ALL DATA IN YOUR DATABASE.
 *
 * It is designed for development purposes only.
 * Do not run this script in a production environment.
 *
 * To run:
 * 1. Make sure you have a .env.local file with your Supabase credentials.
 * 2. Run `npx tsx src/lib/supabase/seed.ts` from the root of your project.
 * -----------------------------------------------------------------------------
 */

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import type { Database } from '../database.types';

type UserRole = Database['public']['Enums']['user_role'];

// Ensure environment variables are loaded
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Supabase URL or Service Role Key is not defined in .env.local');
}

// Supabase client with admin privileges
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const USER_COUNT = 30;
const JOB_OPENING_COUNT = 5;
const APPLICANT_COUNT = 20;

// Helper function for random selection
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('🌱 Starting database seeding process...');

  // --- 1. CLEAN UP EXISTING DATA ---
  console.log('🧹 Clearing existing data...');
  await clearDatabase();

  // --- 2. SEED DEPARTMENTS ---
  console.log('🏢 Seeding departments...');
  const departments = await seedDepartments();
  console.log(`   - Seeded ${departments.length} departments.`);

  // --- 3. SEED USERS AND EMPLOYEES ---
  console.log('👥 Seeding users and employees...');
  const { users, employees } = await seedUsersAndEmployees(departments, USER_COUNT);
  console.log(`   - Seeded ${users.length} users and ${employees.length} employees.`);

  // --- 4. UPDATE MANAGER IDs ---
  console.log('🔗 Assigning managers to employees...');
  await assignManagers(employees, departments);
  console.log('   - Managers assigned.');

  // --- 5. SEED LEAVE DATA ---
  console.log('🌴 Seeding leave data...');
  await seedLeaveData(employees);
  console.log('   - Seeded leave balances, holidays, and requests.');

  // --- 6. SEED RECRUITMENT DATA ---
  console.log('🧑‍💼 Seeding recruitment data...');
  await seedRecruitmentData(employees, JOB_OPENING_COUNT, APPLICANT_COUNT);
  console.log('   - Seeded job openings and applicants.');

  // --- 7. SEED HELPDESK DATA ---
  console.log('🎫 Seeding helpdesk tickets...');
  await seedHelpdeskTickets(employees);
  console.log('   - Seeded helpdesk tickets.');

  // --- 8. SEED COMPANY FEED ---
  console.log('📰 Seeding company feed...');
  await seedCompanyFeed(employees);
  console.log('   - Seeded company feed posts.');
  
  // --- 9. SEED PERFORMANCE REVIEWS ---
  console.log('⭐ Seeding performance reviews...');
  await seedPerformanceReviews(employees);
  console.log('   - Seeded performance reviews.');
  
  // --- 10. SEED PAYROLL HISTORY ---
  console.log('💰 Seeding payroll history...');
  await seedPayrollHistory(employees);
  console.log('   - Seeded payroll history.');

  console.log('✅ Seeding complete!');
  process.exit(0);
}

async function clearDatabase() {
    const tables = [
      'payroll_history', 'performance_reviews', 'helpdesk_messages', 'helpdesk_tickets',
      'interview_notes', 'applicants', 'job_openings', 'leave_requests', 'leave_balances', 'holidays', 'company_feed_posts',
      'employees', 'users', 'departments'
    ];
  
    for (const table of tables) {
      const { error } = await supabaseAdmin.from(table).delete().gt('created_at', '1970-01-01');
      if (error) {
        console.error(`Error clearing table ${table}:`, error.message);
        throw error;
      }
    }
  }

async function seedDepartments() {
  const departmentData = [
    { name: 'Administration', description: 'Overall management and support.' },
    { name: 'Engineering', description: 'Software development and technical innovation.' },
    { name: 'Human Resources', description: 'Manages employee relations, recruitment, and benefits.' },
    { name: 'Product', description: 'Manages product lifecycle and development.' },
    { name: 'Design', description: 'Creates user interfaces and experiences.' },
    { name: 'Marketing', description: 'Promotes the company and its products.' },
    { name: 'Sales', description: 'Drives business growth and revenue.' },
    { name: 'Operations', description: 'Ensures the smooth running of business processes.' },
    { name: 'Finance', description: 'Manages financial planning and records.' },
    { name: 'IT', description: 'Manages information technology and infrastructure.' },
    { name: 'Customer Support', description: 'Assists customers with their inquiries and issues.' },
    { name: 'Quality Assurance', description: 'Ensures product quality and standards.' },
    { name: 'Process Excellence', description: 'Improves business processes and efficiency.' },
    { name: 'Learning & Development', description: 'Provides training and development programs.' },
    { name: 'Client Services', description: 'Manages client relationships and accounts.' },
  ];
  const { data, error } = await supabaseAdmin.from('departments').insert(departmentData).select();
  if (error) throw error;
  return data;
}

async function seedUsersAndEmployees(departments: { id: string; name: string }[], count: number) {
  let createdUsers = [];
  let createdEmployees = [];
  const roles: UserRole[] = ['admin', 'hr', 'manager', 'recruiter', 'employee', 'trainer', 'qa-analyst', 'process-manager', 'team-leader'];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const role = getRandomElement(roles);
    const department = getRandomElement(departments);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'password',
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      console.error(`Error creating auth user ${email}:`, authError.message);
      continue;
    }
    const user = authData.user!;

    const { data: userData, error: userError } = await supabaseAdmin.from('users').insert({
        id: user.id,
        email: user.email!,
        role: role,
        full_name: fullName
    }).select().single();

    if (userError) {
        console.error(`Error creating db user ${email}:`, userError.message);
        continue;
    }
    createdUsers.push(userData);
    
    const { data: employeeData, error: employeeError } = await supabaseAdmin.from('employees').insert({
        user_id: user.id,
        department_id: department.id,
        job_title: faker.person.jobTitle(),
        employee_id: `PEP${faker.string.numeric(4)}`,
        phone_number: faker.phone.number(),
        profile_picture_url: faker.image.avatar(),
        status: getRandomElement(['Active', 'On Leave', 'Terminated']),
        hire_date: faker.date.past({ years: 5 }),
    }).select().single();

    if (employeeError) {
        console.error(`Error creating employee for ${email}:`, employeeError.message);
        continue;
    }
    createdEmployees.push(employeeData);
  }

  return { users: createdUsers, employees: createdEmployees };
}

async function assignManagers(employees: { id: string; department_id: string }[], departments: { id: string; name: string }[]) {
  const managers = employees.slice(0, 5); // Let's make first 5 employees managers

  for (const employee of employees) {
    const potentialManagers = managers.filter(m => m.department_id === employee.department_id && m.id !== employee.id);
    const manager = getRandomElement(potentialManagers) || getRandomElement(managers); // fallback to any manager
    
    if (manager && manager.id !== employee.id) {
        const { error } = await supabaseAdmin.from('employees').update({ manager_id: manager.id }).eq('id', employee.id);
        if (error) console.error(`Failed to assign manager to employee ${employee.id}:`, error.message);
    }
  }
}

async function seedLeaveData(employees: { id: string }[]) {
  // Seed Leave Balances
  const leaveBalances = employees.map(e => ({
    employee_id: e.id,
    sick_leave: faker.number.int({ min: 0, max: 7 }),
    casual_leave: faker.number.int({ min: 0, max: 12 }),
    paid_time_off: faker.number.int({ min: 0, max: 20 }),
  }));
  await supabaseAdmin.from('leave_balances').insert(leaveBalances);

  // Seed Holidays
  const holidays = [
    { name: 'New Year\'s Day', date: `${new Date().getFullYear()}-01-01` },
    { name: 'Republic Day', date: `${new Date().getFullYear()}-01-26` },
    { name: 'Independence Day', date: `${new Date().getFullYear()}-08-15` },
    { name: 'Christmas Day', date: `${new Date().getFullYear()}-12-25` },
  ];
  await supabaseAdmin.from('holidays').insert(holidays);

  // Seed Leave Requests
  const leaveRequests = [];
  for (let i = 0; i < USER_COUNT * 2; i++) {
    const employee = getRandomElement(employees);
    const startDate = faker.date.recent({ days: 30 });
    const endDate = faker.date.soon({ days: 5, refDate: startDate });
    leaveRequests.push({
      employee_id: employee.id,
      leave_type: getRandomElement(['Sick Leave', 'Casual Leave', 'Paid Time Off', 'Work From Home']),
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      reason: faker.lorem.sentence(),
      status: getRandomElement(['Pending', 'Approved', 'Rejected']),
    });
  }
  await supabaseAdmin.from('leave_requests').insert(leaveRequests);
}

async function seedRecruitmentData(employees: { id: string }[], jobCount: number, applicantCount: number) {
  // Seed Job Openings
  const jobOpenings = [];
  for (let i = 0; i < jobCount; i++) {
    jobOpenings.push({
      title: faker.person.jobTitle(),
      description: faker.lorem.paragraphs(2),
      status: 'Open',
      hiring_manager_id: getRandomElement(employees).id,
    });
  }
  const { data: openings } = await supabaseAdmin.from('job_openings').insert(jobOpenings).select();
  if (!openings) return;

  // Seed Applicants
  const applicants = [];
  for (let i = 0; i < applicantCount; i++) {
    applicants.push({
      job_opening_id: getRandomElement(openings).id,
      full_name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      resume_url: faker.internet.url(),
      status: getRandomElement(['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']),
    });
  }
  const { data: createdApplicants } = await supabaseAdmin.from('applicants').insert(applicants).select();
  if (!createdApplicants) return;

  // Seed Interview Notes
  const interviewNotes = [];
  for (const applicant of createdApplicants) {
    if (['Interview', 'Offer', 'Hired'].includes(applicant.status)) {
      interviewNotes.push({
        applicant_id: applicant.id,
        interviewer_id: getRandomElement(employees).id,
        notes: faker.lorem.paragraph(),
      });
    }
  }
  await supabaseAdmin.from('interview_notes').insert(interviewNotes);
}

async function seedHelpdeskTickets(employees: { id: string }[]) {
  const tickets = [];
  for (let i = 0; i < USER_COUNT; i++) {
    tickets.push({
      employee_id: getRandomElement(employees).id,
      subject: faker.lorem.sentence(5),
      description: faker.lorem.paragraph(),
      category: getRandomElement(['IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry']),
      priority: getRandomElement(['Low', 'Medium', 'High']),
      status: getRandomElement(['Open', 'In Progress', 'Closed']),
    });
  }
  const { data: createdTickets } = await supabaseAdmin.from('helpdesk_tickets').insert(tickets).select();
  if (!createdTickets) return;

  // Seed Messages
  const messages = [];
  for (const ticket of createdTickets) {
    messages.push({
      ticket_id: ticket.id,
      sender_id: ticket.employee_id,
      message: ticket.description,
    });
    if (ticket.status !== 'Open') {
      messages.push({
        ticket_id: ticket.id,
        sender_id: getRandomElement(employees).id, // A support agent
        message: faker.lorem.sentence(),
      });
    }
  }
  await supabaseAdmin.from('helpdesk_messages').insert(messages);
}

async function seedCompanyFeed(employees: { id: string }[]) {
    const posts = [];
    for (let i = 0; i < 10; i++) {
        posts.push({
            author_id: getRandomElement(employees).id,
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraphs(3),
            image_url: faker.image.urlLoremFlickr({ category: 'business', width: 600, height: 400 }),
        });
    }
    await supabaseAdmin.from('company_feed_posts').insert(posts);
}

async function seedPerformanceReviews(employees: { id: string }[]) {
    const reviews = [];
    for (const employee of employees) {
        reviews.push({
            employee_id: employee.id,
            reviewer_id: getRandomElement(employees).id,
            review_period: 'Q2 2024',
            overall_rating: getRandomElement(['Exceeds Expectations', 'Meets Expectations', 'Needs Improvement']),
            goals_summary: faker.lorem.paragraph(),
            achievements_summary: faker.lorem.paragraph(),
            improvement_areas: faker.lorem.paragraph(),
        });
    }
    await supabaseAdmin.from('performance_reviews').insert(reviews);
}

async function seedPayrollHistory(employees: { id: string }[]) {
    const payrolls = [];
    for (const employee of employees) {
        for (let i = 1; i <= 3; i++) { // Last 3 months
            const grossSalary = faker.number.float({ min: 4000, max: 15000, precision: 2 });
            const deductions = grossSalary * 0.2;
            payrolls.push({
                employee_id: employee.id,
                pay_period: faker.date.recent({ days: i * 30 }).toISOString().split('T')[0],
                gross_salary: grossSalary,
                deductions: deductions,
                net_salary: grossSalary - deductions,
                payslip_url: faker.internet.url(),
            });
        }
    }
    await supabaseAdmin.from('payroll_history').insert(payrolls);
}


// --- RUN THE SCRIPT ---
main().catch(error => {
  console.error('🔴 Seeding failed:', error);
  process.exit(1);
});
