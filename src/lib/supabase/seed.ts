
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
  'assessment_answers', 'assessment_attempts', 'assessment_questions', 'assessment_sections',
  'asset_assignments', 'it_assets', 'employee_tasks', 'onboarding_tasks', 'software_licenses',
  'payslips', 'expense_claims', 'purchase_orders', 'timesheets',
  'performance_reviews', 'interview_schedules', 'applicants', 'job_openings',
  'company_posts', 'teams', 'budgets', 'employee_compliance_status',
  'compliance_modules', 'coaching_sessions', 'maintenance_schedules', 'production_lines',
  'employees', 'departments'
  // Note: 'department_heads' is not a separate table in the provided schema, it's a field in 'departments'.
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

function generateProfilePicture(name: string) {
  // Use a service that generates unique avatar images
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=400`;
}

function generateRealisticCompanyLogo() {
  return `https://logo.clearbit.com/${faker.internet.domainName()}`;
}


async function clearData() {
  console.log('🗑️ Clearing existing data...');
  
  // Clear all public tables
  for (const table of ALL_TABLES) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition for delete all
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
      // Don't delete the service accounts or default users if any
      if (!user.email?.endsWith('@supabase.com')) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.error(`Failed to delete auth user ${user.id}:`, deleteError.message);
        }
      }
    }
  }
  console.log('✅ Data cleared.');
}

async function seedEnhancedEmployees(departments: any[], existingEmployees: any[]) {
  const enhancedEmployees = existingEmployees.map(emp => {
    const department = departments.find(d => d.id === emp.department_id);
    return {
      id: emp.id,
      employee_id: emp.employee_id,
      full_name: emp.full_name,
      email: emp.email,
      role: emp.role,
      department_id: department?.id,
      job_title: faker.person.jobTitle(),
      hire_date: faker.date.past({ years: 5 }),
      status: 'Active',
      profile_picture_url: generateProfilePicture(emp.full_name),
      bio: faker.person.bio(),
      skills: JSON.stringify([
        faker.person.jobArea(),
        faker.person.jobArea(),
        faker.person.jobArea()
      ]),
      phone_number: faker.phone.number(),
      linkedin_profile: `https://linkedin.com/in/${emp.full_name.toLowerCase().replace(' ', '-')}`,
      emergency_contact: JSON.stringify({
        name: faker.person.fullName(),
        relationship: faker.helpers.arrayElement(['Spouse', 'Parent', 'Sibling', 'Friend']),
        phone: faker.phone.number()
      }),
    };
  });
  const { data: updatedEmployees, error } = await supabase
    .from('employees')
    .upsert(enhancedEmployees)
    .select();
  if(error) {
      console.error("Error seeding enhanced employees", error);
  }
  return updatedEmployees || [];
}

async function seedEnhancedJobOpenings(departments: any[]) {
  const jobOpenings = [
    {
      title: 'Senior Frontend Developer',
      department_id: departments.find(d => d.name === 'Engineering')?.id,
      description: faker.lorem.paragraphs(2),
      salary_range: JSON.stringify({
        min: faker.number.int({min: 80000, max: 100000}),
        max: faker.number.int({min: 120000, max: 150000})
      }),
      location: faker.location.city(),
      job_type: faker.helpers.arrayElement(['Full-time', 'Part-time', 'Contract']),
      company_logo: generateRealisticCompanyLogo()
    },
    {
      title: 'Product Manager',
      department_id: departments.find(d => d.name === 'Product')?.id,
      description: faker.lorem.paragraphs(2),
      salary_range: JSON.stringify({
        min: faker.number.int({min: 90000, max: 110000}),
        max: faker.number.int({min: 130000, max: 160000})
      }),
      location: faker.location.city(),
      job_type: 'Full-time',
      company_logo: generateRealisticCompanyLogo()
    },
  ];
  const { data: openings, error } = await supabase
    .from('job_openings')
    .insert(jobOpenings)
    .select();
    
  if (error) {
      console.error("Error seeding job openings", error);
  }
  return openings || [];
}

async function seedEnhancedApplicants(jobOpenings: any[]) {
    if(!jobOpenings || jobOpenings.length === 0) return [];

  const applicants = jobOpenings.flatMap(opening => 
    Array.from({length: 5}, () => {
        const name = faker.person.fullName();
        return {
            full_name: name,
            email: faker.internet.email(),
            phone_number: faker.phone.number(),
            status: faker.helpers.arrayElement(['Applied', 'Screening', 'Interview', 'Offer']),
            job_opening_id: opening.id,
            resume_url: `https://example.com/resumes/${faker.string.uuid()}.pdf`,
            profile_picture: generateProfilePicture(name),
            linkedin_profile: `https://linkedin.com/in/${faker.internet.userName()}`,
            skills: JSON.stringify([
                faker.person.jobArea(),
                faker.person.jobArea(),
                faker.person.jobArea()
            ])
        }
    })
  );
  const { data: seedededApplicants, error } = await supabase
    .from('applicants')
    .insert(applicants)
    .select();
  if (error) {
      console.error("Error seeding applicants", error);
  }
  return seedededApplicants || [];
}

async function seedEnhancedCompanyPosts(employees: any[]) {
  const posts = Array.from({length: 10}, () => ({
    author_id: faker.helpers.arrayElement(employees).id,
    title: faker.company.catchPhrase(),
    content: faker.lorem.paragraphs(3),
    image_url: `https://picsum.photos/seed/${faker.string.uuid()}/800/400`,
    tags: JSON.stringify([
      faker.word.noun(),
      faker.word.noun(),
      faker.word.noun()
    ]),
    likes_count: faker.number.int({min: 0, max: 100}),
    comments_count: faker.number.int({min: 0, max: 50})
  }));
  const { data: seedededPosts, error } = await supabase
    .from('company_posts')
    .insert(posts)
    .select();
  if(error) {
      console.error("Error seeding company posts", error);
  }
  return seedededPosts || [];
}

async function seedEnhancedITAssets() {
  const assetTypes = [
    { type: 'Laptop', models: ['MacBook Pro', 'Dell XPS', 'Lenovo ThinkPad'] },
    { type: 'Desktop', models: ['iMac', 'Dell Optiplex', 'HP EliteDesk'] },
    { type: 'Monitor', models: ['LG UltraFine', 'Dell Ultrasharp', 'Samsung Odyssey'] }
  ];
  const assets = assetTypes.flatMap(assetGroup => 
    Array.from({length: 10}, () => ({
      asset_tag: `OPT-${assetGroup.type.slice(0,2)}-${faker.string.alphanumeric(6).toUpperCase()}`,
      asset_type: assetGroup.type,
      model: faker.helpers.arrayElement(assetGroup.models),
      status: 'Available', // Use a valid enum value
      purchase_date: faker.date.past({ years: 3 }),
      warranty_end_date: faker.date.future({ years: 2 }),
      image_url: `https://picsum.photos/seed/${faker.string.uuid()}/600/400`,
      serial_number: faker.string.alphanumeric(10).toUpperCase(),
      current_location: faker.location.city()
    }))
  );
  const { data: seedededAssets, error } = await supabase
    .from('it_assets')
    .insert(assets)
    .select();

  if (error) {
      console.error("Error seeding IT assets", error);
  }
  return seedededAssets || [];
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

    // 2. Create Auth Users and initial Employee records
    let initialEmployees = [];
    for(const userData of usersToCreate) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
            app_metadata: { role: userData.role }
        });

        if (authError) { console.error(`Error creating auth user ${userData.email}:`, authError); continue; }
      
        const department = departments.find(d => d.name === userData.departmentName);
        initialEmployees.push({
            id: authData.user.id,
            ...userData,
            department_id: department?.id
        });
    }
     console.log(`  - ✅ ${initialEmployees.length} auth users created.`);

    // 3. Seed Enhanced Employees
    const employees = await seedEnhancedEmployees(departments, initialEmployees);
    console.log(`  - ✅ ${employees.length} employees seeded with enhanced data.`);

    if (employees.length === 0) {
        console.error("No employees were seeded, stopping further seeding.");
        return;
    }
    
    // Assign managers
    const managers = employees.filter(e => e.role === 'manager');
    for (const emp of employees) {
        if (emp.role !== 'manager' && emp.role !== 'admin') {
            const managerInDept = managers.find(m => m.department_id === emp.department_id);
            if(managerInDept) {
                 await supabase.from('employees').update({ manager_id: managerInDept.id }).eq('id', emp.id);
            }
        }
    }
    console.log(`  - ✅ Managers assigned.`);
    
    // 4. Seed other data using enhanced functions
    const openings = await seedEnhancedJobOpenings(departments);
    console.log(`  - ✅ ${openings.length} job openings seeded.`);

    await seedEnhancedApplicants(openings);
    console.log(`  - ✅ Applicants seeded.`);
    
    await seedEnhancedCompanyPosts(employees);
    console.log(`  - ✅ Company posts seeded.`);
    
    await seedEnhancedITAssets();
    console.log(`  - ✅ IT Assets seeded.`);

    // ... (can add more seeding functions here for other tables like leave, etc.)
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
