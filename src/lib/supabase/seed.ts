
// A '.env' file is NOT required for this script to run with hardcoded credentials.
// For security, you would typically use environment variables, but this approach ensures the script runs in any environment.
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// Hardcoded Supabase credentials.
// Replace these with your actual Supabase project details if they differ.
const SUPABASE_URL = "https://qgmknoilorehwimlhngf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWtub2lsb3JlaHdpbWxobmdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5MDcyOSwiZXhwIjoyMDY4NjY2NzI5fQ.ZX7cVFzfOV7PrjSkwxTcrYkk6_3sNqaoVyd2UDfbAf0";


// Initialize the Supabase client with the admin key
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

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

// This is the order in which we should delete from tables to avoid foreign key constraints.
const DELETION_ORDER = [
  'team_members', 'leave_requests', 'helpdesk_tickets',
  'assessment_answers', 'assessment_attempts', 'assessment_questions', 'assessment_sections',
  'asset_assignments', 'it_assets', 'onboarding_tasks',
  'payroll_records', 'expense_claims', 'purchase_orders', 'timesheets',
  'performance_reviews', 'interview_schedules', 'applicants', 'job_openings',
  'company_posts', 'teams', 'budgets', 'employee_compliance_status', 'employee_awards', 'weekly_award_stats',
  'compliance_modules', 'coaching_sessions', 'maintenance_schedules', 'production_lines',
  'payslips', 'leave_balances', 'access_requests',
  'employees', 'departments'
];


async function clearData() {
  console.log('🗑️ Clearing existing data...');
  
  for (const table of DELETION_ORDER) {
    // Use a filter that works for both integer and UUID types
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error && error.code !== '42P01' && error.code !== '42703' && !error.message.includes('does not exist')) { // 42P01: undefined_table, 42703: undefined_column
      console.error(`Error clearing table ${table}:`, error.message);
    }
  }

  const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Error fetching auth users:', usersError);
  } else {
    for (const user of authUsers.users) {
      if (!user.email?.endsWith('@supabase.com')) {
        await supabase.auth.admin.deleteUser(user.id);
      }
    }
  }
  console.log('✅ Data cleared.');
}

function generateProfilePicture(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=400`;
}

function generateRealisticCompanyLogo() {
  return `https://logo.clearbit.com/${faker.internet.domainName()}`;
}

async function seedData() {
  console.log('🌱 Seeding data...');

  // 1. Departments
  const { data: departments, error: deptError } = await supabase.from('departments').insert([
      { name: 'Engineering' }, { name: 'Human Resources' }, { name: 'Sales' },
      { name: 'Marketing' }, { name: 'Support' }, { name: 'Product' },
      { name: 'Design' }, { name: 'Finance' }, { name: 'IT' },
      { name: 'Operations' }, { name: 'Quality' }, { name: 'Administration' },
  ]).select();
  if(deptError) { console.error("Error seeding departments", deptError); return; }
  console.log(`  - ✅ ${departments.length} departments seeded.`);

  // 2. Auth Users & Employees
  let employees = [];
  for(const userData of usersToCreate) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          app_metadata: { role: userData.role }
      });
      if (authError) { console.error(`Error creating auth user ${userData.email}:`, authError); continue; }
    
      const department = departments.find(d => d.name === userData.departmentName);
      const newEmployee = {
          id: authData.user.id,
          employee_id: userData.employee_id,
          full_name: userData.full_name,
          email: userData.email,
          job_title: faker.person.jobTitle(),
          department_id: department?.id,
          hire_date: faker.date.past({ years: 5 }),
          status: 'Active',
          profile_picture_url: generateProfilePicture(userData.full_name),
          phone_number: faker.phone.number(),
          emergency_contact: JSON.stringify({ name: faker.person.fullName(), phone: faker.phone.number() }),
          bio: faker.person.bio(),
          skills: JSON.stringify([faker.person.jobArea(), faker.person.jobArea()]),
          linkedin_profile: `https://linkedin.com/in/${userData.full_name.toLowerCase().replace(' ', '-')}`,
          role: userData.role
      };
      employees.push(newEmployee);
  }
  const { data: seededEmployees, error: empError } = await supabase.from('employees').insert(employees).select();
  if(empError) { console.error("Error seeding employees", empError); return; }
  console.log(`  - ✅ ${seededEmployees.length} employees seeded.`);
  
  // Assign Managers
  const managers = seededEmployees.filter(e => e.role === 'manager');
  for (const emp of seededEmployees) {
      if (emp.role !== 'manager' && emp.role !== 'admin') {
          const managerInDept = managers.find(m => m.department_id === emp.department_id);
          if(managerInDept) {
               await supabase.from('employees').update({ manager_id: managerInDept.id }).eq('id', emp.id);
          }
      }
  }
  console.log(`  - ✅ Managers assigned.`);

  // 3. Job Openings
  const { data: openings } = await supabase.from('job_openings').insert([
    { title: 'Senior Frontend Developer', department_id: departments.find(d=>d.name==='Engineering')?.id, company_logo: generateRealisticCompanyLogo() },
    { title: 'Product Manager', department_id: departments.find(d=>d.name==='Product')?.id, company_logo: generateRealisticCompanyLogo() },
  ]).select();
  console.log(`  - ✅ ${openings.length} job openings seeded.`);

  // 4. Applicants
  if (openings.length > 0) {
    const applicants = openings.flatMap(opening => 
        Array.from({length: 5}, () => {
            const name = faker.person.fullName();
            return {
                full_name: name,
                email: faker.internet.email(),
                phone_number: faker.phone.number(),
                status: faker.helpers.arrayElement(['Applied', 'Screening', 'Interview', 'Offer']),
                job_opening_id: opening.id,
                profile_picture: generateProfilePicture(name),
            }
        })
    );
    const { error: appError } = await supabase.from('applicants').insert(applicants);
    if (!appError) console.log(`  - ✅ ${applicants.length} applicants seeded.`);
  }

  // 5. Company Posts
   const { error: postError } = await supabase.from('company_posts').insert(
    Array.from({length: 5}, () => ({
        author_id: faker.helpers.arrayElement(seededEmployees).id,
        title: faker.company.catchPhrase(),
        content: faker.lorem.paragraphs(3),
        image_url: `https://placehold.co/800x400.png`,
    }))
   );
   if (!postError) console.log(`  - ✅ Company posts seeded.`);
  
   // 6. IT Assets
   const { data: assets } = await supabase.from('it_assets').insert(
     Array.from({length: 20}, () => ({
      asset_tag: `OPT-LT-${faker.string.alphanumeric(6).toUpperCase()}`,
      asset_type: faker.helpers.arrayElement(['Laptop', 'Monitor', 'Keyboard', 'Mouse']),
      model: faker.helpers.arrayElement(['MacBook Pro', 'Dell XPS', 'Lenovo ThinkPad', 'Dell UltraSharp', 'Logitech MX Keys']),
      status: 'Available',
      purchase_date: faker.date.past({ years: 3 }),
      warranty_end_date: faker.date.future({ years: 2 }),
      image_url: `https://placehold.co/600x400.png`,
     }))
   ).select();
   if (!assets) {
     console.error('Error seeding IT Assets');
   } else {
     console.log(`  - ✅ ${assets.length} IT Assets seeded.`);
     // 7. Asset Assignments
     const assetAssignments = seededEmployees.slice(0, 10).map((employee, index) => ({
       asset_id: assets[index].id,
       employee_id: employee.id,
       assignment_date: faker.date.recent(),
     }));
     const { error: assignmentError } = await supabase.from('asset_assignments').insert(assetAssignments);
     if (!assignmentError) console.log(`  - ✅ ${assetAssignments.length} asset assignments seeded.`);
   }

  // 8. Performance Reviews
  const reviewers = seededEmployees.filter(e => ['manager', 'hr', 'admin'].includes(e.role));
  const reviewees = seededEmployees.filter(e => e.role === 'employee');
  const { error: reviewError } = await supabase.from('performance_reviews').insert(
    Array.from({length: 5}, () => ({
        employee_id: faker.helpers.arrayElement(reviewees).id,
        reviewer_id: faker.helpers.arrayElement(reviewers).id,
        review_period: 'Q2 2024',
        rating: faker.number.int({min: 3, max: 5}),
        comments: faker.lorem.paragraph()
    }))
  );
  if (!reviewError) console.log(`  - ✅ Performance reviews seeded.`);

  // 9. Leave Balances and Requests
  for(const employee of seededEmployees) {
    await supabase.from('leave_balances').insert([
        { employee_id: employee.id, leave_type: 'Sick Leave', balance: 10 },
        { employee_id: employee.id, leave_type: 'Casual Leave', balance: 5 },
    ]);
  }
  console.log(`  - ✅ Leave balances seeded for all employees.`);

  const { error: leaveError } = await supabase.from('leave_requests').insert(
    Array.from({length: 10}, () => ({
        employee_id: faker.helpers.arrayElement(seededEmployees).id,
        leave_type: faker.helpers.arrayElement(['Sick Leave', 'Casual Leave', 'Paid Time Off']),
        start_date: faker.date.recent(),
        end_date: faker.date.future(),
        reason: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(['Pending', 'Approved', 'Rejected'])
    }))
  );
  if (!leaveError) console.log(`  - ✅ Leave requests seeded.`);

  // 10. Employee Awards
  const { error: awardError } = await supabase.from('employee_awards').insert(
    Array.from({length: 15}, () => {
        const giver = faker.helpers.arrayElement(seededEmployees);
        let receiver = faker.helpers.arrayElement(seededEmployees);
        while (receiver.id === giver.id) {
            receiver = faker.helpers.arrayElement(seededEmployees);
        }
        return {
            giver_id: giver.id,
            receiver_id: receiver.id,
            points: faker.helpers.arrayElement([100, 200, 500]),
            reason: faker.company.buzzPhrase(),
        }
    })
  );
  if (!awardError) console.log(`  - ✅ Employee awards seeded.`);


}

async function main() {
  console.log('🚀 Starting database seed...');
  await clearData();
  await seedData();
  console.log('🎉 Database seeding complete!');
  console.log('---');
  console.log('Sample Logins:');
  const adminUser = usersToCreate.find(u => u.role === 'admin');
  const managerUser = usersToCreate.find(u => u.role === 'manager');
  const employeeUser = usersToCreate.find(u => u.role === 'employee');
  if(adminUser) console.log(`Admin: ${adminUser.email} / ${adminUser.password}`);
  if(managerUser) console.log(`Manager: ${managerUser.email} / ${managerUser.password}`);
  if(employeeUser) console.log(`Employee: ${employeeUser.employee_id} / ${employeeUser.password}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
