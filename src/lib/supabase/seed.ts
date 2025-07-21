
// A '.env' file is required in the root directory.
// It should contain the following variables:
// SUPABASE_URL="your-supabase-url"
// SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

import { config } from 'dotenv';
config(); // MUST BE THE FIRST LINE

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

// List of all tables in the order they should be cleared
const ALL_TABLES = [
  'team_members', 'leave_requests', 'helpdesk_messages', 'helpdesk_tickets',
  'assessment_answers', 'assessment_attempts', 'assessment_questions', 'assessment_sections', 'assessments',
  'asset_assignments', 'it_assets', 'employee_tasks', 'onboarding_tasks', 'software_licenses',
  'payslips', 'expense_claims', 'purchase_orders', 'timesheets',
  'performance_reviews', 'interview_schedules', 'applicants', 'job_openings',
  'company_posts', 'teams', 'budgets', 'employee_compliance_status',
  'compliance_modules', 'coaching_sessions', 'maintenance_schedules', 'production_lines',
  'employees', 'departments'
];


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

async function clearData() {
  console.log('🗑️ Clearing existing data...');
  
  // Clear all public tables
  for (const table of ALL_TABLES) {
    const { error } = await supabase.from(table).delete().gt('id', 0); // Dummy condition for delete all
    if (error && error.code !== '42P01') { // 42P01: undefined_table
      console.error(`Error clearing table ${table}:`, error.message);
    }
  }

  // Clear auth users
  const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Error fetching auth users:', usersError);
  } else {
    for (const user of authUsers.users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Failed to delete auth user ${user.id}:`, deleteError.message);
      }
    }
  }
  console.log('✅ Data cleared.');
}

async function seedData() {
  console.log('🌱 Seeding data...');

    // 1. Seed Departments
    const { data: departments, error: deptError } = await supabase.from('departments').insert([
        { name: 'Engineering' }, { name: 'Human Resources' }, { name: 'Sales' },
        { name: 'Marketing' }, { name: 'Support' }, { name: 'Product' },
        { name: 'Design' }, { name: 'Finance' }, { name: 'IT' },
        { name: 'Operations' }, { name: 'Quality' }, { name: 'Administration' },
    ]).select();
    if(deptError) { console.error("Error seeding departments", deptError); return; }
    console.log(`  - ✅ ${departments.length} departments seeded.`);

    // 2. Seed Users & Employees
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
      if (!department) {
        console.warn(`Department '${userData.departmentName}' not found for user ${userData.email}. Skipping employee creation.`);
        continue;
      }
      
      const { data: employee, error: empError } = await supabase.from('employees').insert({
        id: authData.user.id,
        employee_id: userData.employee_id,
        full_name: userData.full_name,
        email: userData.email,
        job_title: faker.person.jobTitle(),
        department: department.name,
        hire_date: faker.date.past({ years: 5 }),
        profile_picture_url: `https://placehold.co/400x400.png?text=${userData.full_name.split(' ').map(n=>n[0]).join('')}`,
        status: 'Active',
      }).select().single();

      if (empError) { console.error(`Error inserting employee ${userData.email}:`, empError); continue; }
      
      createdEmployees.push(employee);
    }
    console.log(`  - ✅ ${createdEmployees.length} employees seeded.`);

    if (createdEmployees.length === 0) {
        console.error("No employees were created, stopping seed.");
        return;
    }

    // 3. Seed Job Openings and Applicants
    const { data: openings } = await supabase.from('job_openings').insert([
        { title: 'Senior Frontend Developer', department: 'Engineering', status: 'Open' },
        { title: 'Product Manager', department: 'Product', status: 'Open' },
    ]).select();

    if(openings) {
        let applicants = [];
        for(const opening of openings) {
            for(let i = 0; i < 5; i++) {
                applicants.push({
                    full_name: faker.person.fullName(),
                    email: faker.internet.email(),
                    phone_number: faker.phone.number(),
                    status: faker.helpers.arrayElement(['Applied', 'Screening', 'Interview', 'Offer']),
                    job_opening_id: opening.id,
                    resume_url: 'https://example.com/resume.pdf'
                });
            }
        }
        await supabase.from('applicants').insert(applicants);
        console.log(`  - ✅ ${applicants.length} applicants seeded.`);
    }

    // 4. Seed Company Posts
    const posts = [];
    for(let i=0; i<3; i++) {
        posts.push({
            author_id: faker.helpers.arrayElement(createdEmployees).id,
            title: faker.company.catchPhrase(),
            content: faker.lorem.paragraphs(2)
        });
    }
    await supabase.from('company_posts').insert(posts);
    console.log(`  - ✅ ${posts.length} company posts seeded.`);

    // 5. Seed Leave Requests
    const leaveRequests = [];
    for(let i=0; i<10; i++) {
        const startDate = faker.date.recent({days: 30});
        const endDate = new Date(startDate.getTime() + (1000 * 60 * 60 * 24 * faker.number.int({min: 0, max: 4})));
        leaveRequests.push({
            employee_id: faker.helpers.arrayElement(createdEmployees).id,
            leave_type: faker.helpers.arrayElement(['Sick Leave', 'Casual Leave', 'Paid Time Off']),
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            reason: faker.lorem.sentence(),
            status: faker.helpers.arrayElement(['Pending', 'Approved', 'Rejected']),
        });
    }
    await supabase.from('leave_requests').insert(leaveRequests);
    console.log(`  - ✅ ${leaveRequests.length} leave requests seeded.`);
    
    // 6. Seed Helpdesk Tickets
    const helpdeskTickets = [];
    for(let i=0; i<10; i++) {
        helpdeskTickets.push({
            ticket_ref: `HD-${faker.string.alphanumeric(6).toUpperCase()}`,
            employee_id: faker.helpers.arrayElement(createdEmployees).id,
            subject: faker.hacker.phrase(),
            description: faker.lorem.paragraph(),
            category: faker.helpers.arrayElement(['IT Support', 'HR Query', 'Payroll Issue']),
            priority: faker.helpers.arrayElement(['Low', 'Medium', 'High']),
            status: faker.helpers.arrayElement(['Open', 'In Progress', 'Closed']),
        });
    }
    await supabase.from('helpdesk_tickets').insert(helpdeskTickets);
    console.log(`  - ✅ ${helpdeskTickets.length} helpdesk tickets seeded.`);

    // 7. Seed Performance Reviews
    const managers = createdEmployees.filter(e => e.role === 'manager' || e.role === 'admin' || e.role === 'hr' );
    if (managers.length > 0) {
        const reviews = [];
        for (const emp of createdEmployees) {
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
        console.log(`  - ✅ ${reviews.length} performance reviews seeded.`);
    }

    // 8. Seed IT Assets
    const assets = [];
    for (let i=0; i<20; i++) {
        assets.push({
            asset_tag: `OPT-LT-${faker.string.alphanumeric(6).toUpperCase()}`,
            asset_type: 'Laptop',
            model: faker.helpers.arrayElement(['MacBook Pro 16"', 'Dell XPS 15', 'Lenovo ThinkPad X1']),
            status: 'Available',
            purchase_date: faker.date.past({ years: 2 }),
            warranty_end_date: faker.date.future({ years: 1 }),
        });
    }
    await supabase.from('it_assets').insert(assets);
    console.log(`  - ✅ ${assets.length} IT assets seeded.`);

     // 9. Seed Assessments
    const { data: assessments } = await supabase.from('assessments').insert([
        { title: 'Customer Support Aptitude', process_type: 'Chat Support', duration_minutes: 30, passing_score: 75 },
        { title: 'Technical Support (Level 1)', process_type: 'Technical Support', duration_minutes: 45, passing_score: 80 },
    ]).select();

    if (assessments) {
        const { data: sections } = await supabase.from('assessment_sections').insert([
            { assessment_id: assessments[0].id, title: 'Situational Judgement', section_type: 'mcq', time_limit_minutes: 15 },
            { assessment_id: assessments[1].id, title: 'Basic Networking', section_type: 'mcq', time_limit_minutes: 20 },
        ]).select();
        
        if (sections) {
            await supabase.from('assessment_questions').insert([
                { section_id: sections[0].id, question_text: 'A customer is angry about a late delivery. What is the FIRST step?', question_type: 'mcq', options: '["Offer a refund","Apologize and listen","Explain the delay","Transfer call"]', correct_answer: 'Apologize and listen' },
                { section_id: sections[1].id, question_text: 'What is a DHCP server used for?', question_type: 'mcq', options: '["Resolve domains","Assign IPs","Block access","Store files"]', correct_answer: 'Assign IPs' }
            ]);
        }
        console.log(`  - ✅ Assessments, sections, and questions seeded.`);
    }
}

async function main() {
  console.log('🚀 Starting database seed...');
  await clearData();
  await seedData();
  console.log('🎉 Database seeding complete!');
  console.log('---');
  console.log('Sample Logins:');
  console.log('Admin Email: admin@optitalent.com, Password: password');
  console.log('Manager Email: manager@optitalent.com, Password: password');
  const sampleEmployee = usersToCreate.find(e => e.role === 'employee');
  if(sampleEmployee) {
    console.log(`Sample Employee ID: ${sampleEmployee.employee_id}, Password: ${sampleEmployee.password}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
