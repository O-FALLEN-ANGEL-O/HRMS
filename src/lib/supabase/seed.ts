
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
 * 2. Run `npm run db:seed` from the root of your project.
 * -----------------------------------------------------------------------------
 */

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import type { Database } from '../database.types';
import { mockUsers } from '../mock-data/employees';

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

async function main() {
  console.log('🌱 Starting database seeding process...');
  
  // --- 1. CLEAN UP AUTH AND PUBLIC DATA ---
  console.log('🧹 Clearing existing data...');
  await clearAllData();

  // --- 2. SEED DEPARTMENTS ---
  console.log('🏢 Seeding departments...');
  const departments = await seedDepartments();
  console.log(`   - Seeded ${departments.length} departments.`);

  // --- 3. SEED USERS AND EMPLOYEES ---
  console.log('👥 Seeding users and employees...');
  const { users, employees } = await seedUsersAndEmployees(departments);
  console.log(`   - Seeded ${users.length} auth users and ${employees.length} employee profiles.`);

  console.log('✅ Seeding complete!');
  process.exit(0);
}


async function clearAllData() {
    console.log('   - Clearing public tables...');
    const tables = [ 'employees', 'departments', 'users' ];
  
    for (const table of tables) {
      const { error } = await supabaseAdmin.from(table).delete().gt('id', '0'); // A trick to delete all rows
      if (error) {
        console.error(`   - Error clearing table ${table}:`, error.message);
      }
    }
    console.log('   - Public tables cleared.');

    console.log('   - Clearing auth users...');
    const { data: { users: existingUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if(listError) {
        console.error('   - Error listing auth users:', listError.message);
        return;
    }

    const deletePromises = existingUsers.map(user => supabaseAdmin.auth.admin.deleteUser(user.id));
    const results = await Promise.allSettled(deletePromises);
    
    const failedDeletions = results.filter(result => result.status === 'rejected');
    if (failedDeletions.length > 0) {
        console.error('   - Some auth users could not be deleted.');
        failedDeletions.forEach(failure => console.error(failure.reason));
    } else {
        console.log(`   - Cleared ${existingUsers.length} auth users.`);
    }
}


async function seedDepartments() {
  const departmentData = [
    { id: 'd-000', name: 'Administration' },
    { id: 'd-001', name: 'Engineering' },
    { id: 'd-002', name: 'Human Resources' },
    { id: 'd-003', name: 'Quality Assurance' },
    { id: 'd-004', name: 'Process Excellence' },
    { id: 'd-005', name: 'Customer Support' },
    { id: 'd-006', name: 'Marketing' },
    { id: 'd-007', name: 'Finance' },
    { id: 'd-008', name: 'IT' },
    { id: 'd-009', name: 'Operations' },
    { id: 'd-010', name: 'Client Services' },
    { id: 'd-011', name: 'Learning & Development' },
  ];
  const { data, error } = await supabaseAdmin.from('departments').insert(departmentData).select();
  if (error) throw error;
  return data;
}

async function seedUsersAndEmployees(departments: any[]) {
  const newAuthUsers = [];
  console.log(`   - Creating ${mockUsers.length} new auth users...`);
  for (const mockUser of mockUsers) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: mockUser.email,
        password: 'password', // A default password for all mock users
        email_confirm: true,
        user_metadata: { full_name: mockUser.profile.full_name },
      });
      if (authError) {
        console.error(`   - Error creating auth user ${mockUser.email}:`, authError.message);
        continue;
      }
      newAuthUsers.push(authData.user);
  }

  // Insert into public.users
  const usersToInsert = newAuthUsers.map(user => {
      const mock_user = mockUsers.find(u => u.email === user.email);
      return {
          id: user.id,
          email: user.email,
          role: mock_user?.role || 'employee',
      }
  });

  const { error: usersError } = await supabaseAdmin.from('users').insert(usersToInsert);
  if (usersError) throw usersError;

  // Insert into public.employees
  const employeesToInsert = mockUsers.map(mock => {
      const authUser = newAuthUsers.find(u => u.email === mock.email);
      const department = departments.find(d => d.name === mock.profile.department.name);
      if(!authUser) {
          console.warn(`   - Could not find matching auth user for ${mock.email}, skipping employee profile.`);
          return null;
      }
      return {
          id: mock.profile.id,
          user_id: authUser.id,
          full_name: mock.profile.full_name,
          job_title: mock.profile.job_title,
          employee_id: mock.profile.employee_id,
          department_id: department?.id,
          phone_number: mock.profile.phone_number,
          profile_picture_url: mock.profile.profile_picture_url,
          status: mock.profile.status,
      };
  }).filter(e => e !== null);

  const { data: employeesData, error: employeesError } = await supabaseAdmin.from('employees').insert(employeesToInsert as any).select();
  if(employeesError) throw employeesError;

  return { users: newAuthUsers, employees: employeesData };
}

// --- RUN THE SCRIPT ---
main().catch(error => {
  console.error('🔴 Seeding failed:', error);
  process.exit(1);
});
