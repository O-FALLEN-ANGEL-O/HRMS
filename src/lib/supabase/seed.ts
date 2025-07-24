
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

  // --- 1. SEED USERS AND EMPLOYEES ---
  // This must run first to handle auth users.
  console.log('👥 Seeding users and employees...');
  const { users, employees } = await seedUsersAndEmployees();
  console.log(`   - Synced ${users.length} users and ${employees.length} employees.`);
  
  // --- 2. CLEAN UP PUBLIC DATA ---
  console.log('🧹 Clearing existing public data...');
  await clearPublicTables();
  
  // --- 3. SEED DEPARTMENTS ---
  console.log('🏢 Seeding departments...');
  const departments = await seedDepartments();
  console.log(`   - Seeded ${departments.length} departments.`);

  // --- 4. RE-INSERT EMPLOYEES AND USERS with correct department IDs ---
  console.log('🔄 Re-inserting users and employees with correct relationships...');
  await seedPublicUsersAndEmployees(users, departments);
  console.log('   - Public user and employee tables populated.');

  console.log('✅ Seeding complete!');
  process.exit(0);
}

async function clearPublicTables() {
    const tables = [
      'employees', 'users', 'departments'
    ];
  
    for (const table of tables) {
      const { error } = await supabaseAdmin.from(table).delete().gt('id', '0'); // A trick to delete all rows
      if (error) {
        console.error(`Error clearing table ${table}:`, error.message);
        // Don't throw, as table might not exist on first run
      }
    }
}


async function seedUsersAndEmployees() {
  const { data: { users: existingUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    throw listError;
  }
  
  const existingUserEmails = new Set(existingUsers.map(u => u.email));
  const mockUserEmails = new Set(mockUsers.map(u => u.email));
  let syncedUsers = [];

  // 1. Create users that are in mock data but not in Supabase auth
  for (const mockUser of mockUsers) {
    if (!existingUserEmails.has(mockUser.email)) {
      console.log(`   - Creating new auth user: ${mockUser.email}`);
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: mockUser.email,
        password: 'password',
        email_confirm: true,
        user_metadata: { full_name: mockUser.profile.full_name },
      });
      if (authError) {
        console.error(`Error creating auth user ${mockUser.email}:`, authError.message);
        continue;
      }
      syncedUsers.push(authData.user);
    } else {
        const existing = existingUsers.find(u => u.email === mockUser.email);
        if(existing) syncedUsers.push(existing);
    }
  }

  // 2. (Optional but recommended) Delete users in Supabase auth that are NOT in mock data
  const usersToDelete = existingUsers.filter(u => !mockUserEmails.has(u.email!));
  for (const userToDelete of usersToDelete) {
      console.log(`   - Deleting old auth user: ${userToDelete.email}`);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);
      if (deleteError) {
          console.error(`Error deleting user ${userToDelete.email}:`, deleteError.message);
      }
  }
  
  // Map mock profiles to the now-synced auth users
  const employeesData = syncedUsers.map(user => {
    const mock_profile = mockUsers.find(mu => mu.email === user.email)?.profile;
    return {
        ...mock_profile, // contains full_name, job_title, etc.
        user_id: user.id, // Link to the auth user
        email: user.email,
        role: mock_profile?.role || 'employee',
        profile_picture_url: `https://ui-avatars.com/api/?name=${mock_profile?.full_name.replace(/ /g, '+')}&background=random`,
    }
  });

  return { users: syncedUsers, employees: employeesData };
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

async function seedPublicUsersAndEmployees(authUsers: any[], departments: any[]) {
    // Insert into public.users
    const usersToInsert = authUsers.map(user => {
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
        const authUser = authUsers.find(u => u.email === mock.email);
        const department = departments.find(d => d.name === mock.profile.department.name);
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
    });

    const { error: employeesError } = await supabaseAdmin.from('employees').insert(employeesToInsert);
    if(employeesError) throw employeesError;
}


// --- RUN THE SCRIPT ---
main().catch(error => {
  console.error('🔴 Seeding failed:', error);
  process.exit(1);
});
