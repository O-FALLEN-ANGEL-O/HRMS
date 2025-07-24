
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
import * as dotenv from 'dotenv';

// Ensure environment variables are loaded from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// --- VALIDATE ENVIRONMENT VARIABLES ---
if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL_HERE' || !supabaseServiceKey || supabaseServiceKey.includes('YOUR_SUPABASE_SERVICE_KEY')) {
  throw new Error(
    'Supabase URL or Service Role Key is not defined or is still set to the placeholder value in .env.local. Please update it with your actual Supabase credentials.'
  );
}

// Supabase client with admin privileges
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

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
  await seedUsersAndEmployees(departments);

  console.log('✅ Seeding complete!');
  process.exit(0);
}


async function clearAllData() {
  console.log('   - Clearing public tables...');
  // Order matters due to foreign key constraints
  const tables = ['employees', 'users', 'departments'];

  for (const table of tables) {
    const { error } = await supabaseAdmin.from(table).delete().gt('id', '0'); // A trick to delete all rows
    if (error) {
      console.error(`   - Error clearing table ${table}:`, error.message);
    }
  }
  console.log('   - Public tables cleared.');
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
    console.log(`   - Checking for existing auth users...`);
    const { data: { users: existingAuthUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    
    const existingEmails = new Set(existingAuthUsers.map(u => u.email));
    console.log(`   - Found ${existingEmails.size} existing auth users.`);

    const newAuthUsers = [];
    const newPublicUsers = [];
    const newEmployees = [];

    for (const mockUser of mockUsers) {
        let authUser = existingAuthUsers.find(u => u.email === mockUser.email);
        
        if (!authUser) {
            console.log(`   - Creating auth user for ${mockUser.email}...`);
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email: mockUser.email,
                password: 'password', // A default password for all mock users
                email_confirm: true,
                user_metadata: { full_name: mockUser.profile.full_name },
            });
            if (error) {
                console.error(`   - Error creating auth user ${mockUser.email}:`, error.message);
                continue;
            }
            authUser = data.user;
            newAuthUsers.push(authUser);
        }

        const publicUser = {
            id: authUser.id,
            email: authUser.email,
            role: mockUser.role,
        };
        newPublicUsers.push(publicUser);

        const department = departments.find(d => d.name === mockUser.profile.department.name);
        const employee = {
            id: mockUser.profile.id,
            user_id: authUser.id,
            full_name: mockUser.profile.full_name,
            job_title: mockUser.profile.job_title,
            employee_id: mockUser.profile.employee_id,
            department_id: department?.id,
            phone_number: mockUser.profile.phone_number,
            profile_picture_url: mockUser.profile.profile_picture_url,
            status: mockUser.profile.status,
        };
        newEmployees.push(employee);
    }
  
    if (newPublicUsers.length > 0) {
      console.log(`   - Seeding ${newPublicUsers.length} public users...`);
      const { error: usersError } = await supabaseAdmin.from('users').insert(newPublicUsers);
      if (usersError) throw usersError;
    } else {
        console.log(`   - No new public users to seed.`);
    }

    if (newEmployees.length > 0) {
      console.log(`   - Seeding ${newEmployees.length} employee profiles...`);
      const { error: employeesError } = await supabaseAdmin.from('employees').insert(newEmployees);
      if (employeesError) throw employeesError;
    } else {
        console.log(`   - No new employee profiles to seed.`);
    }

    console.log(`   - Successfully seeded ${newAuthUsers.length} new auth users and linked ${newEmployees.length} employee profiles.`);
}

// --- RUN THE SCRIPT ---
main().catch(error => {
  console.error('🔴 Seeding failed:', error);
  process.exit(1);
});
