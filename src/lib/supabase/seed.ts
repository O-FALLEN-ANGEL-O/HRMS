
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
  'team_members',
  'leave_requests',
  'helpdesk_messages', 'helpdesk_tickets',
  'assessment_answers', 'assessment_attempts', 'assessment_questions', 'assessment_sections',
  'asset_assignments', 'it_assets',
  'employee_tasks', 'onboarding_tasks',
  'payslips', 'expense_claims', 'purchase_orders', 'timesheets',
  'performance_reviews',
  'interview_schedules', 'applicants', 'job_openings',
  'company_posts', 'teams',
  'budgets',
  'employee_compliance_status', 'compliance_modules',
  'coaching_sessions',
  'maintenance_schedules', 'production_lines',
  // Main tables last
  'employees', 'departments',
];


async function clearData() {
  console.log('🗑️ Clearing existing data...');
  
  for (const table of ALL_TABLES) {
    const { error } = await supabase.from(table).delete().gt('id', 0); // Use a dummy condition to delete all
    if (error && error.code !== '42P01') { // 42P01: table does not exist
      console.error(`Error clearing table ${table}:`, error.message);
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

async function seedData() {
    console.log('🌱 Seeding data...');

    // 1. Seed Departments
    const { data: departments, error: deptError } = await supabase.from('departments').insert([
        { name: 'Engineering' },
        { name: 'Human Resources' },
        { name: 'Sales' },
        { name: 'Marketing' },
        { name: 'Support' },
        { name: 'Product' },
        { name: 'Design' },
        { name: 'Finance' },
        { name: 'IT' },
        { name: 'Operations' },
        { name: 'Quality' },
        { name: 'Administration' },
    ]).select();
    if(deptError) { console.error("Error seeding departments", deptError); return; }
    console.log(`✅ ${departments.length} departments seeded.`);

    // 2. Seed Users & Employees
    const usersToCreate = [
      { email: 'admin@optitalent.com', password: 'password', role: 'admin', departmentName: 'Administration', full_name: 'Admin User', employee_id: 'PEP0001' },
      { email: 'hr@optitalent.com', password: 'password', role: 'hr', departmentName: 'Human Resources', full_name: 'HR User', employee_id: 'PEP0002' },
      { email: 'manager@optitalent.com', password: 'password', role: 'manager', departmentName: 'Engineering', full_name: 'Isabella Nguyen', employee_id: 'PEP0003' },
      { email: 'recruiter@optitalent.com', password: 'password', role: 'recruiter', departmentName: 'Human Resources', full_name: 'Sofia Davis', employee_id: 'PEP0004' },
      { email: 'qa-analyst@optitalent.com', password: 'password', role: 'qa-analyst', departmentName: 'Quality', full_name: 'QA Analyst User', employee_id: 'PEP0005' },
      { email: 'process-manager@optitalent.com', password: 'password', role: 'process-manager', departmentName: 'Operations', full_name: 'Process Manager User', employee_id: 'PEP0006' },
      { email: 'team-leader@optitalent.com', password: 'password', role: 'team-leader', departmentName: 'Support', full_name: 'Liam Smith', employee_id: 'PEP0007' },
      { email: 'marketing@optitalent.com', password: 'password', role: 'marketing', departmentName: 'Marketing', full_name: 'Marketing Head', employee_id: 'PEP0008' },
      { email: 'finance@optitalent.com', password: 'password', role: 'finance', departmentName: 'Finance', full_name: 'Emma Jones', employee_id: 'PEP0009' },
      { email: 'it-manager@optitalent.com', password: 'password', role: 'it-manager', departmentName: 'IT', full_name: 'Mason Rodriguez', employee_id: 'PEP0010' },
      { email: 'operations-manager@optitalent.com', password: 'password', role: 'operations-manager', departmentName: 'Operations', full_name: 'Operations Manager User', employee_id: 'PEP0011' },
      { email: 'employee@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Engineering', full_name: 'Anika Sharma', employee_id: 'PEP0012' },
      { email: 'employee2@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Engineering', full_name: 'Rohan Verma', employee_id: 'PEP0013' },
      { email: 'employee3@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Support', full_name: 'Priya Mehta', employee_id: 'PEP0014' },
      { email: 'employee4@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Support', full_name: 'Ava Wilson', employee_id: 'PEP0015' },
      { email: 'employee5@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Support', full_name: 'Noah Brown', employee_id: 'PEP0016' },
    ];
    
    let createdEmployees = [];
    for(const userData of usersToCreate) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        app_metadata: { role: userData.role }
      });
      if (authError) { console.error(`Error creating auth user ${userData.email}:`, authError); continue; }

      const department = departments.find(d => d.name === userData.departmentName);
      const employeeData = {
        id: authData.user.id,
        employee_id: userData.employee_id,
        full_name: userData.full_name,
        email: userData.email,
        job_title: faker.person.jobTitle(),
        department: department?.name,
        hire_date: faker.date.past({ years: 5 }),
        profile_picture_url: `https://placehold.co/400x400.png?text=${userData.full_name.split(' ').map(n=>n[0]).join('')}`,
      };
      createdEmployees.push(employeeData);
    }
    const { data: employees, error: empError } = await supabase.from('employees').insert(createdEmployees).select();
    if(empError) { console.error("Error seeding employees", empError); return; }
    console.log(`✅ ${employees.length} employees seeded.`);

    // 3. Seed Job Openings and Applicants
    const { data: openings } = await supabase.from('job_openings').insert([
        { title: 'Senior Frontend Developer', department: 'Engineering' },
        { title: 'Product Manager', department: 'Product' },
    ]).select();

    if(openings) {
        let applicants = [];
        for(const opening of openings) {
            for(let i = 0; i < 10; i++) {
                applicants.push({
                    full_name: faker.person.fullName(),
                    email: faker.internet.email(),
                    phone_number: faker.phone.number(),
                    status: faker.helpers.arrayElement(['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']),
                    job_opening_id: opening.id,
                    resume_url: 'https://example.com/resume.pdf'
                });
            }
        }
        await supabase.from('applicants').insert(applicants);
        console.log(`✅ ${applicants.length} applicants seeded.`);
    }

    // 4. Seed Company Posts
    const posts = [];
    for(let i=0; i<5; i++) {
        posts.push({
            author_id: faker.helpers.arrayElement(employees).id,
            title: faker.company.catchPhrase(),
            content: faker.lorem.paragraphs(3)
        });
    }
    await supabase.from('company_posts').insert(posts);
    console.log(`✅ ${posts.length} company posts seeded.`);


    // 5. Seed Leave Requests
    const leaveRequests = [];
    for(let i=0; i<15; i++) {
        const startDate = faker.date.recent({days: 30});
        const endDate = new Date(startDate.getTime() + (1000 * 60 * 60 * 24 * faker.number.int({min: 0, max: 4})));
        leaveRequests.push({
            employee_id: faker.helpers.arrayElement(employees).id,
            leave_type: faker.helpers.arrayElement(['Sick Leave', 'Casual Leave', 'Paid Time Off']),
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            reason: faker.lorem.sentence(),
            status: faker.helpers.arrayElement(['Pending', 'Approved', 'Rejected']),
        });
    }
    await supabase.from('leave_requests').insert(leaveRequests);
    console.log(`✅ ${leaveRequests.length} leave requests seeded.`);
    
    // 6. Seed Helpdesk Tickets
    const helpdeskTickets = [];
    for(let i=0; i<20; i++) {
        helpdeskTickets.push({
            ticket_ref: `HD-${faker.string.alphanumeric(6).toUpperCase()}`,
            employee_id: faker.helpers.arrayElement(employees).id,
            subject: faker.hacker.phrase(),
            description: faker.lorem.paragraph(),
            category: faker.helpers.arrayElement(['IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry']),
            priority: faker.helpers.arrayElement(['Low', 'Medium', 'High']),
            status: faker.helpers.arrayElement(['Open', 'In Progress', 'Closed']),
        });
    }
    await supabase.from('helpdesk_tickets').insert(helpdeskTickets);
    console.log(`✅ ${helpdeskTickets.length} helpdesk tickets seeded.`);

    // 7. Seed Assessments
    const { data: assessments } = await supabase.from('assessments').insert([
        { title: 'Customer Support Aptitude Test', process_type: 'Chat Support', duration_minutes: 30, passing_score: 75, created_by_id: employees[0].id },
        { title: 'Technical Support (Level 1)', process_type: 'Technical Support', duration_minutes: 45, passing_score: 80, created_by_id: employees[0].id },
        { title: 'Typing Skill Test', process_type: 'Chat Support', duration_minutes: 5, passing_score: 50, created_by_id: employees[0].id },
    ]).select();
    console.log(`✅ ${assessments?.length || 0} assessments seeded.`);

    if (assessments) {
        const { data: sections } = await supabase.from('assessment_sections').insert([
            { assessment_id: assessments[0].id, title: 'Situational Judgement', section_type: 'mcq', time_limit_minutes: 15},
            { assessment_id: assessments[2].id, title: 'Typing Speed and Accuracy', section_type: 'typing', time_limit_minutes: 5},
        ]).select();
        
        if(sections) {
            await supabase.from('assessment_questions').insert([
                { section_id: sections[0].id, question_text: 'A customer is angry. What do you do first?', question_type: 'mcq', options: JSON.stringify(['Apologize', 'Refund', 'Explain', 'Transfer']), correct_answer: 'Apologize' },
                { section_id: sections[1].id, question_text: 'Please type the following paragraph.', question_type: 'typing', typing_prompt: 'The quick brown fox jumps over the lazy dog.' }
            ]);
            console.log(`✅ Sections and questions seeded.`);
        }
    }
    
    // 8. Seed Performance Reviews
    const reviews = [];
    const managers = employees.filter(e => e.role === 'manager' || e.role === 'admin' || e.role === 'hr' );
    if (managers.length > 0) {
        for (const emp of employees) {
            if (emp.role !== 'manager' && emp.role !== 'admin') {
                 reviews.push({
                    employee_id: emp.id,
                    reviewer_id: faker.helpers.arrayElement(managers).id,
                    review_period: 'Q2 2024',
                    goals: faker.lorem.sentence(),
                    achievements: faker.lorem.sentence(),
                    areas_for_improvement: faker.lorem.sentence(),
                    rating: faker.helpers.arrayElement(['Exceeds Expectations', 'Meets Expectations', 'Needs Improvement'])
                });
            }
        }
        await supabase.from('performance_reviews').insert(reviews);
        console.log(`✅ ${reviews.length} performance reviews seeded.`);
    }

    console.log('🎉 Database seeding complete!');
}


async function main() {
  console.log('🚀 Starting database seed...');
  await clearData(); 
  await seedData();
  console.log('---');
  console.log('Sample Logins:');
  console.log('Admin Email: admin@optitalent.com, Password: password');
  console.log('Manager Email: manager@optitalent.com, Password: password');
  
  const sampleEmployee = usersToCreate.find(e => e.email === 'employee@optitalent.com');
  if(sampleEmployee) {
    console.log(`Sample Employee ID: ${sampleEmployee.employee_id}, Password: password123`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
