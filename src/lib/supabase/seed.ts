
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

function generateProfilePicture(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=400`;
}

function generateRealisticCompanyLogo() {
  return `https://logo.clearbit.com/${faker.internet.domainName()}`;
}

async function seedData() {
  console.log('🌱 Seeding data...');

  // 1. Departments (Upsert)
  const departmentsToUpsert = [
      { name: 'Engineering' }, { name: 'Human Resources' }, { name: 'Sales' },
      { name: 'Marketing' }, { name: 'Support' }, { name: 'Product' },
      { name: 'Design' }, { name: 'Finance' }, { name: 'IT' },
      { name: 'Operations' }, { name: 'Quality' }, { name: 'Administration' },
  ];
  const { data: departments, error: deptError } = await supabase.from('departments').upsert(departmentsToUpsert, { onConflict: 'name' }).select();
  if(deptError) { console.error("Error seeding departments", deptError); return; }
  console.log(`  - ✅ ${departments.length} departments seeded.`);

  // 2. Auth Users & Employees (Upsert)
  let seededCount = 0;
  const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();

  for(const userData of usersToCreate) {
      let authUser = existingUsers.find(u => u.email === userData.email);

      if (authUser) {
          // If user exists, forcefully update their password and metadata
          const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
              password: userData.password,
              email_confirm: true,
              app_metadata: { role: userData.role }
          });
          if (error) { console.error(`Error updating auth user ${userData.email}:`, error); continue; }
          authUser = data.user;
      } else {
          // If user does not exist, create them
          const { data, error } = await supabase.auth.admin.createUser({
              email: userData.email,
              password: userData.password,
              email_confirm: true,
              app_metadata: { role: userData.role }
          });
          if (error) { console.error(`Error creating auth user ${userData.email}:`, error); continue; }
          authUser = data.user;
      }
    
      const department = departments.find(d => d.name === userData.departmentName);
      const employeeData = {
          id: authUser.id,
          employee_id: userData.employee_id,
          full_name: userData.full_name,
          email: userData.email,
          job_title: faker.person.jobTitle(),
          department_id: department?.id,
          hire_date: faker.date.past({ years: 5 }),
          status: 'Active',
          profile_picture_url: generateProfilePicture(userData.full_name),
          phone_number: faker.phone.number(),
          role: userData.role
      };
      
      const { error: empError } = await supabase.from('employees').upsert(employeeData, { onConflict: 'id' });
      if(empError) { console.error(`Error seeding employee ${userData.email}`, empError); continue; }
      seededCount++;
  }
  console.log(`  - ✅ ${seededCount} employees seeded.`);
  
  const { data: seededEmployees } = await supabase.from('employees').select('id, role, department_id');
  
  // Assign Managers
  if (seededEmployees) {
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
  }


  // 3. Job Openings
  const { data: openings, error: openingError } = await supabase.from('job_openings').upsert([
    { title: 'Senior Frontend Developer', department_id: departments.find(d=>d.name==='Engineering')?.id, company_logo: generateRealisticCompanyLogo() },
    { title: 'Product Manager', department_id: departments.find(d=>d.name==='Product')?.id, company_logo: generateRealisticCompanyLogo() },
  ], { onConflict: 'title' }).select();
  if(openingError) { console.error("Error seeding job openings", openingError) }
  else { console.log(`  - ✅ ${openings?.length || 0} job openings seeded.`); }

  // 4. Applicants
  if (openings && openings.length > 0) {
    const { count } = await supabase.from('applicants').select('*', { count: 'exact', head: true });
    if(count === 0) {
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
  }

  // 5. Company Posts
   if (seededEmployees && seededEmployees.length > 0) {
    const { count } = await supabase.from('company_posts').select('*', { count: 'exact', head: true });
    if (count === 0) {
        const { error: postError } = await supabase.from('company_posts').insert(
        Array.from({length: 5}, () => ({
            author_id: faker.helpers.arrayElement(seededEmployees).id,
            title: faker.company.catchPhrase(),
            content: faker.lorem.paragraphs(3),
            image_url: `https://placehold.co/800x400.png`,
        }))
        );
        if (!postError) console.log(`  - ✅ 5 Company posts seeded.`);
    }
   }
  
   // 6. Leave Balances and Requests
  if (seededEmployees && seededEmployees.length > 0) {
    for(const employee of seededEmployees) {
      await supabase.from('leave_balances').upsert([
          { employee_id: employee.id, leave_type: 'Sick Leave', balance: 10 },
          { employee_id: employee.id, leave_type: 'Casual Leave', balance: 5 },
      ], { onConflict: 'employee_id, leave_type' });
    }
    console.log(`  - ✅ Leave balances seeded for all employees.`);
  }

}

async function main() {
  console.log('🚀 Starting database seed...');
  await seedData();
  console.log('🎉 Database seeding complete!');
  console.log('---');
  console.log('Sample Logins:');
  const adminUser = usersToCreate.find(u => u.role === 'admin');
  const managerUser = usersToCreate.find(u => u.role === 'manager');
  const employeeUser = usersToCreate.find(u => u.role === 'employee');
  if(adminUser) console.log(`Admin: ${adminUser.employee_id} / ${adminUser.password}`);
  if(managerUser) console.log(`Manager: ${managerUser.employee_id} / ${managerUser.password}`);
  if(employeeUser) console.log(`Employee: ${employeeUser.employee_id} / ${employeeUser.password}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
