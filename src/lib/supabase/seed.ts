
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

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const roles = [
  'admin',
  'hr',
  'manager',
  'employee',
  'recruiter',
  'qa-analyst',
  'process-manager',
  'team-leader',
  'marketing',
  'finance',
  'it-manager',
  'operations-manager',
] as const;
type Role = (typeof roles)[number];

const departments = [
  'Administration',
  'Human Resources',
  'Engineering',
  'Marketing',
  'Sales',
  'Finance',
  'IT',
  'Operations',
  'Quality',
  'Support',
];

const statuses = ['Active', 'On Leave', 'Inactive'];

const userPasswords = new Map<string, string>();

async function clearData() {
  console.log('🗑️ Clearing existing data...');

  // Get all tables
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (tablesError) {
    console.error('Error fetching tables:', tablesError);
    return;
  }

  // Disable RLS for deletion
  const tableNames = tables
    .map((t) => t.table_name)
    .filter((name) => !name.startsWith('pg_') && name !== 'schema_migrations'); // Exclude system tables

  for (const tableName of tableNames) {
    try {
      // Supabase does not allow disabling RLS directly via API for security reasons.
      // This must be done in the Supabase Dashboard SQL Editor if needed.
      // We will rely on the service_role key to bypass RLS.
      const { error } = await supabase.from(tableName).delete().gt('id', 0); // Hack to delete all
      if (error)
        console.error(`Error clearing ${tableName}:`, error.message);
    } catch (e) {
      console.error(`Exception clearing ${tableName}:`, e);
    }
  }

  // Clear auth users
  const { data: authUsers, error: usersError } =
    await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Error fetching auth users:', usersError);
  } else {
    for (const user of authUsers.users) {
      await supabase.auth.admin.deleteUser(user.id);
    }
  }

  console.log('✅ Data cleared.');
}

async function seedUsersAndEmployees() {
  console.log('🌱 Seeding users and employees...');
  const usersToCreate = 50;
  const createdUsers = [];

  for (let i = 0; i < usersToCreate; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const password = 'password123'; // Simple password for all seeded users
    userPasswords.set(email, password);

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.error(`Error creating auth user ${email}:`, authError.message);
      continue;
    }

    if (authUser.user) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const department =
        departments[Math.floor(Math.random() * departments.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const employeeData = {
        id: authUser.user.id,
        employee_id: `PEP${(i + 1).toString().padStart(4, '0')}`,
        full_name: `${firstName} ${lastName}`,
        email: email,
        job_title: faker.person.jobTitle(),
        department: department,
        role: role,
        status: status,
        hire_date: faker.date.past({ years: 5 }),
        salary: faker.number.int({ min: 40000, max: 150000 }),
        profile_picture_url: faker.image.avatar(),
        phone_number: faker.phone.number(),
        address: faker.location.streetAddress(true),
        emergency_contact_name: faker.person.fullName(),
        emergency_contact_phone: faker.phone.number(),
        profile_complete: faker.datatype.boolean(0.8), // 80% chance of being true
      };
      createdUsers.push(employeeData);
    }
  }

  const { error: insertError } = await supabase
    .from('employees')
    .insert(createdUsers);

  if (insertError) {
    console.error('Error inserting employees:', insertError.message);
  } else {
    console.log(`✅ ${createdUsers.length} users and employees seeded.`);
  }

  return createdUsers;
}

async function seedLeaveData(employees: any[]) {
    console.log('🌱 Seeding leave data...');
    if (employees.length === 0) return;

    const leaveRequests = [];
    for (const employee of employees) {
        for (let i = 0; i < faker.number.int({ min: 0, max: 5 }); i++) {
            const startDate = faker.date.past({ years: 1 });
            const endDate = faker.date.soon({ days: 5, refDate: startDate });
            leaveRequests.push({
                employee_id: employee.id,
                leave_type: faker.helpers.arrayElement(['Sick Leave', 'Casual Leave', 'Paid Time Off', 'Work From Home']),
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                reason: faker.lorem.sentence(),
                status: faker.helpers.arrayElement(['Pending', 'Approved', 'Rejected']),
            });
        }
    }
    await supabase.from('leave_requests').insert(leaveRequests);
    console.log(`✅ ${leaveRequests.length} leave requests seeded.`);
}

async function seedCompanyPosts(employees: any[]) {
    console.log('🌱 Seeding company posts...');
    if (employees.length === 0) return;

    const posts = [];
    for (let i = 0; i < 10; i++) {
        const author = faker.helpers.arrayElement(employees);
        posts.push({
            author_id: author.id,
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraphs(3),
        });
    }
    await supabase.from('company_posts').insert(posts);
    console.log(`✅ ${posts.length} company posts seeded.`);
}

async function seedHelpdeskTickets(employees: any[]) {
    console.log('🌱 Seeding helpdesk tickets...');
    if (employees.length === 0) return;

    const tickets = [];
    for (let i = 0; i < 30; i++) {
        const requester = faker.helpers.arrayElement(employees);
        const agent = faker.helpers.arrayElement(employees.filter(e => e.role === 'hr' || e.role === 'it-manager' || e.role === 'admin'));
        tickets.push({
            requester_id: requester.id,
            agent_id: agent ? agent.id : null,
            subject: faker.lorem.sentence(5),
            description: faker.lorem.paragraph(),
            category: faker.helpers.arrayElement(['IT Support', 'HR Query', 'Payroll Issue', 'Facilities', 'General Inquiry']),
            status: faker.helpers.arrayElement(['Open', 'In Progress', 'Closed']),
            priority: faker.helpers.arrayElement(['Low', 'Medium', 'High']),
        });
    }
    await supabase.from('helpdesk_tickets').insert(tickets);
    console.log(`✅ ${tickets.length} helpdesk tickets seeded.`);
}

async function seedAssessmentsAndQuestions() {
  console.log('🌱 Seeding assessments and questions...');
  
  const assessmentData = [
    { title: 'Customer Support Aptitude Test', process_type: 'Chat Support', passing_score: 75, duration: 30 },
    { title: 'Technical Support (Level 1)', process_type: 'Technical Support', passing_score: 80, duration: 45 },
    { title: 'Voice Assessment (English)', process_type: 'Voice Process – English', passing_score: 70, duration: 15 },
    { title: 'Typing Skill Test', process_type: 'Chat Support', passing_score: 50, duration: 5 },
  ];

  const { data: insertedAssessments, error: assessError } = await supabase.from('assessments').insert(assessmentData).select();
  if (assessError) {
    console.error('Error inserting assessments:', assessError.message);
    return;
  }
  console.log(`✅ ${insertedAssessments.length} assessments seeded.`);

  // Seed Sections and Questions for Typing Test
  const typingAssessment = insertedAssessments.find(a => a.title === 'Typing Skill Test');
  if (typingAssessment) {
    const { data: section } = await supabase.from('assessment_sections').insert({ assessment_id: typingAssessment.id, title: 'Typing Speed and Accuracy', time_limit: 5, section_type: 'typing' }).select().single();
    if(section) {
        await supabase.from('assessment_questions').insert({
            section_id: section.id,
            type: 'typing',
            question_text: 'Please type the following paragraph.',
            typing_prompt: 'The quick brown fox jumps over the lazy dog. This sentence contains all the letters of the alphabet, making it a perfect pangram for testing typing speed and accuracy. Fast, accurate typing is a critical skill for any professional in a digital-first world. Practice regularly to improve your words per minute and reduce errors. Focus on maintaining a steady rhythm and correct finger placement on the keyboard. Good luck!'
        });
    }
  }

  // Seed Sections and Questions for Aptitude Test
   const aptitudeAssessment = insertedAssessments.find(a => a.title === 'Customer Support Aptitude Test');
   if(aptitudeAssessment) {
        const { data: section1 } = await supabase.from('assessment_sections').insert({ assessment_id: aptitudeAssessment.id, title: 'Situational Judgement', time_limit: 15, section_type: 'mcq' }).select().single();
        if(section1) {
             await supabase.from('assessment_questions').insert([
                {
                    section_id: section1.id,
                    type: 'mcq',
                    question_text: 'A customer is angry about a late delivery. What is the FIRST step you should take?',
                    options: [
                        'Offer a refund immediately.',
                        'Apologize for the inconvenience and listen to their concerns.',
                        'Explain why the delivery was late.',
                        'Transfer the call to a manager.',
                    ],
                    correct_answer: 'Apologize for the inconvenience and listen to their concerns.',
                },
                {
                    section_id: section1.id,
                    type: 'mcq',
                    question_text: 'What does CRM stand for?',
                    options: [
                        'Customer Relationship Management',
                        'Customer Retention Module',
                        'Company Resource Management',
                        'Client Response Machine',
                    ],
                    correct_answer: 'Customer Relationship Management',
                },
            ]);
        }
   }

  console.log('✅ Assessment sections and questions seeded.');
}


async function main() {
  console.log('🚀 Starting database seed...');
  // Since clearing data is destructive, it's commented out by default.
  // Uncomment the next line if you want to start with a fresh database.
  // await clearData(); 

  const employees = await seedUsersAndEmployees();
  if (employees && employees.length > 0) {
      await seedLeaveData(employees);
      await seedCompanyPosts(employees);
      await seedHelpdeskTickets(employees);
      await seedAssessmentsAndQuestions();
      // Add calls to other seeding functions here as they are created
      // e.g., await seedRecruitmentData(employees);
  }

  console.log('🎉 Database seeding complete!');
  console.log('---');
  console.log('Sample Admin/Manager Login:');
  console.log('Email: manager@optitalent.com');
  console.log('Password: password');
  console.log('---');
  console.log('Sample Employee Login:');
  const sampleEmployee = employees.find(e => e.role === 'employee');
  if(sampleEmployee) {
    console.log(`Employee ID: ${sampleEmployee.employee_id}`);
    console.log('Password: password123');
  } else {
    console.log('No employee user was created to show as an example.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
