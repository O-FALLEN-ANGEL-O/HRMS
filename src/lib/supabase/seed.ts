
// A '.env' file is required in the root directory.
// It should contain the following variables:
// SUPABASE_URL="your-supabase-url"
// SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// Check for required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Supabase URL or service role key not found in environment variables. Please check your .env file.'
  );
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// List of all tables in the order they should be cleared/seeded
const ALL_TABLES = [
  // Junction/dependent tables first
  'assessment_answers', 'assessment_attempts', 'assessment_questions', 'assessment_sections',
  'asset_assignments', 'it_assets', 'software_licenses',
  'company_posts', 'team_members', 'teams', 'leave_requests', 'helpdesk_tickets',
  'performance_reviews', 'payroll_records', 'expense_claims', 'purchase_orders', 'timesheets',
  'employee_awards', 'weekly_award_stats', 'notifications',
  'interview_schedules', 'typing_test_scores', 'applicants', 'job_openings',
  'department_heads', 'department_projects', 'department_dashboards', 'budgets',
  'compliance_modules', 'employee_compliance_status', 'coaching_sessions',
  'production_lines', 'maintenance_schedules',
  // Main tables last
  'employees', 'departments',
];


async function clearData() {
  console.log('🗑️ Clearing existing data...');
  
  for (const table of ALL_TABLES) {
    const { error } = await supabase.from(table).delete().gt('id', 0);
    if (error && error.code !== '42P01') { // 42P01: table does not exist
      console.error(`Error clearing table ${table}:`, error);
    }
  }

  // Clear auth users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Error fetching auth users:', usersError);
  } else {
    for (const user of users) {
      await supabase.auth.admin.deleteUser(user.id);
    }
  }

  console.log('✅ Data cleared.');
}


async function seedUsersAndEmployees() {
  console.log('🌱 Seeding users and employees...');
  const usersToCreate = [
    { email: 'admin@optitalent.com', password: 'password', role: 'admin', departmentName: 'Administration', full_name: 'Admin User' },
    { email: 'hr@optitalent.com', password: 'password', role: 'hr', departmentName: 'Human Resources', full_name: 'HR User' },
    { email: 'manager@optitalent.com', password: 'password', role: 'manager', departmentName: 'Engineering', full_name: 'Isabella Nguyen' },
    { email: 'recruiter@optitalent.com', password: 'password', role: 'recruiter', departmentName: 'Human Resources', full_name: 'Sofia Davis' },
    { email: 'qa-analyst@optitalent.com', password: 'password', role: 'qa-analyst', departmentName: 'Quality', full_name: 'QA Analyst User' },
    { email: 'process-manager@optitalent.com', password: 'password', role: 'process-manager', departmentName: 'Operations', full_name: 'Process Manager User' },
    { email: 'team-leader@optitalent.com', password: 'password', role: 'team-leader', departmentName: 'Support', full_name: 'Liam Smith' },
    { email: 'marketing@optitalent.com', password: 'password', role: 'marketing', departmentName: 'Marketing', full_name: 'Marketing Head' },
    { email: 'finance@optitalent.com', password: 'password', role: 'finance', departmentName: 'Finance', full_name: 'Emma Jones' },
    { email: 'it-manager@optitalent.com', password: 'password', role: 'it-manager', departmentName: 'IT', full_name: 'Mason Rodriguez' },
    { email: 'operations-manager@optitalent.com', password: 'password', role: 'operations-manager', departmentName: 'Operations', full_name: 'Operations Manager User' },
    { email: 'employee@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Engineering', full_name: 'Anika Sharma' },
    { email: 'employee2@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Engineering', full_name: 'Rohan Verma' },
    { email: 'employee3@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Support', full_name: 'Priya Mehta' },
    { email: 'employee4@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Support', full_name: 'Ava Wilson' },
    { email: 'employee5@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Support', full_name: 'Noah Brown' },
  ];

  // Seed Departments
  const departmentNames = [...new Set(usersToCreate.map(u => u.departmentName))];
  const departmentsToInsert = departmentNames.map(name => ({ name }));
  const { data: departments, error: deptError } = await supabase.from('departments').insert(departmentsToInsert).select();
  if (deptError) {
      console.error('Error seeding departments:', deptError);
      return [];
  }
  console.log(`✅ ${departments.length} departments seeded.`);

  const createdEmployees = [];
  let employeeCounter = 1;

  for (const userData of usersToCreate) {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

    if (authError) {
      console.error(`Error creating auth user ${userData.email}:`, authError);
      continue;
    }
    
    if (authUser.user) {
      const department = departments.find(d => d.name === userData.departmentName);
      const employeeData = {
        id: authUser.user.id,
        employee_id: `PEP${(employeeCounter++).toString().padStart(4, '0')}`,
        full_name: userData.full_name,
        email: userData.email,
        job_title: faker.person.jobTitle(),
        department_id: department?.id,
        role: userData.role as any,
        status: 'Active',
        hire_date: faker.date.past({ years: 5 }),
        salary: faker.number.int({ min: 40000, max: 150000 }),
        profile_picture_url: `https://placehold.co/400x400.png?text=${userData.full_name.split(' ').map(n=>n[0]).join('')}`,
      };
      createdEmployees.push(employeeData);
    }
  }

  if (createdEmployees.length > 0) {
      const { error: insertError } = await supabase.from('employees').insert(createdEmployees);
      if (insertError) {
        console.error('Error inserting employees:', insertError);
      } else {
        console.log(`✅ ${createdEmployees.length} users and employees seeded.`);
      }
  }

  return createdEmployees;
}

async function seedDepartmentHeads(employees: any[], departments: any[]) {
    console.log('🌱 Seeding department heads...');
    if (!employees || employees.length === 0) return;
    const headsToInsert = [];
    const departmentHeads = employees.filter(e => ['manager', 'hr', 'admin', 'it-manager', 'finance', 'marketing'].includes(e.role));

    for(const dept of departments) {
        const head = departmentHeads.find(h => h.department_id === dept.id);
        if (head) {
            headsToInsert.push({ user_id: head.id, department_id: dept.id });
        }
    }
    
    if(headsToInsert.length > 0) {
        const { error } = await supabase.from('department_heads').insert(headsToInsert);
        if (error) console.error('Error seeding department heads:', error);
        else console.log(`✅ ${headsToInsert.length} department heads seeded.`);
    }
}

async function seedJobOpenings(employees: any[]) {
    console.log('🌱 Seeding job openings...');
    if (!employees || employees.length === 0) return;
    const recruiters = employees.filter(e => e.role === 'recruiter');
    if(recruiters.length === 0) return;

    const openings = [
        { title: 'Senior Frontend Developer', status: 'Open' },
        { title: 'Product Manager', status: 'Open' },
        { title: 'UI/UX Designer', status: 'Open' },
        { title: 'DevOps Engineer', status: 'Closed' },
    ];

    const openingsToInsert = openings.map(o => ({
        ...o,
        description: faker.lorem.paragraph(),
        posted_by: faker.helpers.arrayElement(recruiters).id
    }));

    const { data, error } = await supabase.from('job_openings').insert(openingsToInsert).select();
    if(error) console.error('Error seeding job openings:', error);
    else console.log(`✅ ${data.length} job openings seeded.`);
    return data;
}

async function seedApplicantsAndInterviews(jobOpenings: any[] | null, employees: any[]) {
    console.log('🌱 Seeding applicants and interviews...');
    if(!jobOpenings || jobOpenings.length === 0 || !employees || employees.length === 0) return;

    const applicantsToInsert = [];
    const interviewsToInsert = [];
    const typingScoresToInsert = [];
    const recruiters = employees.filter(e => e.role === 'recruiter');
    if (recruiters.length === 0) return;

    for(const opening of jobOpenings) {
        for(let i=0; i<faker.number.int({min: 5, max: 15}); i++) {
            const applicantId = `APP-${faker.string.alphanumeric(8).toUpperCase()}`;
            applicantsToInsert.push({
                applicant_id: applicantId,
                job_id: opening.id,
                full_name: faker.person.fullName(),
                email: faker.internet.email(),
                phone: faker.phone.number(),
                resume_url: 'https://example.com/resume.pdf',
                status: faker.helpers.arrayElement(['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']),
            });

            // Seed interviews for some
            if(Math.random() > 0.5) {
                interviewsToInsert.push({
                    applicant_id: applicantId,
                    recruiter_id: faker.helpers.arrayElement(recruiters).id,
                    mode: faker.helpers.arrayElement(['Online', 'In-Person']),
                    datetime: faker.date.future(),
                    location: 'OptiTalent HQ',
                    meeting_link: 'https://meet.google.com/xyz-abc-def',
                });
            }

            // Seed typing scores for some
             if(Math.random() > 0.3) {
                typingScoresToInsert.push({
                    applicant_id: applicantId,
                    score: faker.number.int({min: 30, max: 90}), // WPM
                    attempt: 1,
                });
            }
        }
    }
    
    if(applicantsToInsert.length > 0) {
        const { error } = await supabase.from('applicants').insert(applicantsToInsert);
        if(error) console.error('Error seeding applicants', error);
        else console.log(`✅ ${applicantsToInsert.length} applicants seeded.`);
    }
     if(interviewsToInsert.length > 0) {
        const { error } = await supabase.from('interview_schedules').insert(interviewsToInsert);
        if(error) console.error('Error seeding interviews', error);
        else console.log(`✅ ${interviewsToInsert.length} interviews seeded.`);
    }
    if(typingScoresToInsert.length > 0) {
        const { error } = await supabase.from('typing_test_scores').insert(typingScoresToInsert);
        if(error) console.error('Error seeding typing scores', error);
        else console.log(`✅ ${typingScoresToInsert.length} typing scores seeded.`);
    }
}


async function seedPerformanceAndPayroll(employees: any[]) {
    console.log('🌱 Seeding performance reviews and payroll...');
    if (!employees || employees.length === 0) return;
    const managers = employees.filter(e => e.role === 'manager' || e.role === 'admin' || e.role === 'hr');
    const recordsToInsert = [];
    const payrollToInsert = [];

    for(const emp of employees) {
        if(managers.length > 0) {
            recordsToInsert.push({
                employee_id: emp.id,
                reviewer_id: faker.helpers.arrayElement(managers).id,
                rating: faker.number.int({min: 1, max: 5}),
                comments: faker.lorem.paragraph(),
            });
        }
        payrollToInsert.push({
            employee_id: emp.id,
            month: '2024-07',
            amount: emp.salary,
            bonuses: faker.number.int({min: 0, max: 2000}),
            deductions: faker.number.int({min: 100, max: 1000}),
        });
    }

    if(recordsToInsert.length > 0) {
        const { error } = await supabase.from('performance_reviews').insert(recordsToInsert);
        if(error) console.error('Error seeding performance reviews', error);
        else console.log(`✅ ${recordsToInsert.length} performance reviews seeded.`);
    }
    if(payrollToInsert.length > 0) {
        const { error } = await supabase.from('payroll_records').insert(payrollToInsert);
        if(error) console.error('Error seeding payroll', error);
        else console.log(`✅ ${payrollToInsert.length} payroll records seeded.`);
    }
}


async function seedEmployeeAwards(employees: any[]) {
    console.log('🌱 Seeding employee awards...');
    if (!employees || employees.length === 0) return;
    const awardsToInsert = [];
    for(let i=0; i<30; i++) {
        const giver = faker.helpers.arrayElement(employees);
        const receiver = faker.helpers.arrayElement(employees.filter(e => e.id !== giver.id));
        awardsToInsert.push({
            giver_id: giver.id,
            receiver_id: receiver.id,
            reason: faker.lorem.sentence(),
        });
    }
     if(awardsToInsert.length > 0) {
        const { error } = await supabase.from('employee_awards').insert(awardsToInsert);
        if(error) console.error('Error seeding awards', error);
        else console.log(`✅ ${awardsToInsert.length} employee awards seeded.`);
    }
}

async function main() {
  console.log('🚀 Starting database seed...');
  await clearData(); 
  
  const employees = await seedUsersAndEmployees();
  
  if (employees && employees.length > 0) {
    const { data: departments } = await supabase.from('departments').select('id, name');
    const jobOpenings = await seedJobOpenings(employees);

    await Promise.all([
        seedDepartmentHeads(employees, departments || []),
        seedApplicantsAndInterviews(jobOpenings, employees),
        seedPerformanceAndPayroll(employees),
        seedEmployeeAwards(employees),
    ]);
  }

  console.log('🎉 Database seeding complete!');
  console.log('---');
  console.log('Sample Logins:');
  console.log('Admin Email: admin@optitalent.com, Password: password');
  console.log('Manager Email: manager@optitalent.com, Password: password');
  
  const sampleEmployee = employees.find(e => e.email === 'employee@optitalent.com');
  if(sampleEmployee) {
    console.log(`Sample Employee ID: ${sampleEmployee.employee_id}, Password: password123`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

    