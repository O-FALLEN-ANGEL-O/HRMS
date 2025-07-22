
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
    { email: 'admin@optitalent.com', password: 'password', role: 'admin', departmentName: 'Administration', name: 'Admin User', emp_id: 'PEP0001' },
    { email: 'hr@optitalent.com', password: 'password', role: 'hr', departmentName: 'Human Resources', name: 'HR User', emp_id: 'PEP0002' },
    { email: 'manager@optitalent.com', password: 'password', role: 'manager', departmentName: 'Engineering', name: 'Isabella Nguyen', emp_id: 'PEP0003' },
    { email: 'recruiter@optitalent.com', password: 'password', role: 'recruiter', departmentName: 'Human Resources', name: 'Sofia Davis', emp_id: 'PEP0004' },
    { email: 'qa-analyst@optitalent.com', password: 'password', role: 'qa-analyst', departmentName: 'Quality', name: 'QA Analyst User', emp_id: 'PEP0005' },
    { email: 'process-manager@optitalent.com', password: 'password', role: 'process-manager', departmentName: 'Operations', name: 'Process Manager User', emp_id: 'PEP0006' },
    { email: 'team-leader@optitalent.com', password: 'password', role: 'team-leader', departmentName: 'Support', name: 'Liam Smith', emp_id: 'PEP0007' },
    { email: 'marketing@optitalent.com', password: 'password', role: 'marketing', departmentName: 'Marketing', name: 'Marketing Head', emp_id: 'PEP0008' },
    { email: 'finance@optitalent.com', password: 'password', role: 'finance', departmentName: 'Finance', name: 'Emma Jones', emp_id: 'PEP0009' },
    { email: 'it-manager@optitalent.com', password: 'password', role: 'it-manager', departmentName: 'IT', name: 'Mason Rodriguez', emp_id: 'PEP0010' },
    { email: 'operations-manager@optitalent.com', password: 'password', role: 'operations-manager', departmentName: 'Operations', name: 'Operations Manager User', emp_id: 'PEP0011' },
    { email: 'employee@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Engineering', name: 'Anika Sharma', emp_id: 'PEP0012' },
    { email: 'employee2@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Engineering', name: 'Rohan Verma', emp_id: 'PEP0013' },
    { email: 'employee3@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Support', name: 'Priya Mehta', emp_id: 'PEP0014' },
    { email: 'employee4@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Support', name: 'Ava Wilson', emp_id: 'PEP0015' },
    { email: 'employee5@optitalent.com', password: 'password123', role: 'employee', departmentName: 'Support', name: 'Noah Brown', emp_id: 'PEP0016' },
];

const rolesToSeed = [
    { name: 'admin', description: 'Full system access' },
    { name: 'hr', description: 'Access to HR modules' },
    { name: 'manager', description: 'Manages a team' },
    { name: 'recruiter', description: 'Manages recruitment pipeline' },
    { name: 'employee', description: 'Standard employee access' },
    { name: 'qa-analyst', description: 'Conducts quality assurance audits' },
    { name: 'process-manager', description: 'Oversees business processes' },
    { name: 'team-leader', description: 'Leads a specific team' },
    { name: 'marketing', description: 'Manages marketing campaigns' },
    { name: 'finance', description: 'Manages payroll and finance' },
    { name: 'it-manager', description: 'Manages IT infrastructure' },
    { name: 'operations-manager', description: 'Manages core business operations' },
];

async function seedData() {
  console.log('🌱 Seeding data...');

  // 1. Seed Roles
  const { error: roleError } = await supabase.from('roles').upsert(rolesToSeed, { onConflict: 'name' });
  if(roleError) { console.error("Error seeding roles", roleError); return; }
  console.log(`  - ✅ ${rolesToSeed.length} roles seeded.`);

  // 2. Seed Departments
  const departmentsToUpsert = [
      { name: 'Engineering' }, { name: 'Human Resources' }, { name: 'Sales' },
      { name: 'Marketing' }, { name: 'Support' }, { name: 'Product' },
      { name: 'Design' }, { name: 'Finance' }, { name: 'IT' },
      { name: 'Operations' }, { name: 'Quality' }, { name: 'Administration' },
  ];
  const { data: departments, error: deptError } = await supabase.from('departments').upsert(departmentsToUpsert, { onConflict: 'name' }).select();
  if(deptError) { console.error("Error seeding departments", deptError); return; }
  console.log(`  - ✅ ${departments.length} departments seeded.`);

  // 3. Auth Users & Employees (Upsert)
  let seededCount = 0;
  const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();

  for(const userData of usersToCreate) {
      let authUser = existingUsers.find(u => u.email === userData.email);

      if (authUser) {
          const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
              password: userData.password,
              email_confirm: true,
          });
          if (error) { console.error(`Error updating auth user ${userData.email}:`, error); continue; }
          authUser = data.user;
      } else {
          const { data, error } = await supabase.auth.admin.createUser({
              email: userData.email,
              password: userData.password,
              email_confirm: true,
              user_metadata: { name: userData.name },
          });
          if (error) { console.error(`Error creating auth user ${userData.email}:`, error); continue; }
          authUser = data.user;
      }
    
      const department = departments.find(d => d.name === userData.departmentName);
      const employeeData = {
          id: authUser.id,
          emp_id: userData.emp_id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          department: department?.name,
          password: authUser.encrypted_password, // This is hashed, not for login
          joined_on: faker.date.past({ years: 5 }),
          status: 'active',
      };
      
      const { error: empError } = await supabase.from('employees').upsert(employeeData, { onConflict: 'id' });
      if(empError) { console.error(`Error seeding employee ${userData.email}`, empError); continue; }
      seededCount++;
  }
  console.log(`  - ✅ ${seededCount} employees seeded.`);
  
  const { data: seededEmployees } = await supabase.from('employees').select('id, role, department');
  
  // Assign Managers
  if (seededEmployees) {
    const managers = seededEmployees.filter(e => e.role === 'manager');
    for (const emp of seededEmployees) {
        if (emp.role !== 'manager' && emp.role !== 'admin') {
            const managerInDept = managers.find(m => m.department === emp.department);
            if(managerInDept) {
                // This part of the logic may need refinement based on final schema
                // For now, we'll skip explicit manager assignment in seed
            }
        }
    }
    console.log(`  - ✅ Managers assigned.`);
  }
}

async function main() {
  console.log('🚀 Starting database seed...');
  await seedData();
  console.log('🎉 Database seeding complete!');
  console.log('---');
  console.log('Sample Logins (Employee ID / Password):');
  const adminUser = usersToCreate.find(u => u.role === 'admin');
  const managerUser = usersToCreate.find(u => u.role === 'manager');
  const employeeUser = usersToCreate.find(u => u.role === 'employee');
  if(adminUser) console.log(`Admin: ${adminUser.emp_id} / ${adminUser.password}`);
  if(managerUser) console.log(`Manager: ${managerUser.emp_id} / ${managerUser.password}`);
  if(employeeUser) console.log(`Employee: ${employeeUser.emp_id} / ${employeeUser.password}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
