
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

async function clearData() {
  console.log('🗑️ Clearing existing data...');
  const { data: tables, error } = await supabase.rpc('get_all_tables');

  if (error) {
    console.error('Error fetching tables:', error);
    return;
  }

  // Disable RLS for deletion - we are using service_role key
  for (const table of tables) {
    console.log(`- Deleting from ${table.table_name}`);
    const { error: deleteError } = await supabase.from(table.table_name).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    if (deleteError) {
      console.error(`Error clearing ${table.table_name}:`, deleteError.message);
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

async function seedUsersAndEmployees() {
  console.log('🌱 Seeding users and employees...');
  const usersToCreate = [
    { email: 'admin@optitalent.com', password: 'password', role: 'admin', department: 'Administration' },
    { email: 'hr@optitalent.com', password: 'password', role: 'hr', department: 'Human Resources' },
    { email: 'manager@optitalent.com', password: 'password', role: 'manager', department: 'Engineering' },
    { email: 'recruiter@optitalent.com', password: 'password', role: 'recruiter', department: 'Human Resources' },
    { email: 'qa-analyst@optitalent.com', password: 'password', role: 'qa-analyst', department: 'Quality' },
    { email: 'process-manager@optitalent.com', password: 'password', role: 'process-manager', department: 'Operations' },
    { email: 'team-leader@optitalent.com', password: 'password', role: 'team-leader', department: 'Support' },
    { email: 'marketing@optitalent.com', password: 'password', role: 'marketing', department: 'Marketing' },
    { email: 'finance@optitalent.com', password: 'password', role: 'finance', department: 'Finance' },
    { email: 'it-manager@optitalent.com', password: 'password', role: 'it-manager', department: 'IT' },
    { email: 'operations-manager@optitalent.com', password: 'password', role: 'operations-manager', department: 'Operations' },
    { email: 'employee@optitalent.com', password: 'password123', role: 'employee', department: 'Engineering' },
    { email: 'employee2@optitalent.com', password: 'password123', role: 'employee', department: 'Marketing' },
    { email: 'employee3@optitalent.com', password: 'password123', role: 'employee', department: 'Support' },
  ];

  const createdEmployees = [];

  let employeeCounter = 1;
  for (const userData of usersToCreate) {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

    if (authError) {
      console.error(`Error creating auth user ${userData.email}:`, authError.message);
      continue;
    }
    
    if (authUser.user) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      const employeeData = {
        id: authUser.user.id,
        employee_id: `PEP${(employeeCounter++).toString().padStart(4, '0')}`,
        full_name: `${firstName} ${lastName}`,
        email: userData.email,
        job_title: faker.person.jobTitle(),
        department: userData.department,
        role: userData.role,
        status: faker.helpers.arrayElement(['Active', 'On Leave']),
        hire_date: faker.date.past({ years: 5 }),
        salary: faker.number.int({ min: 40000, max: 150000 }),
        profile_picture_url: `https://placehold.co/400x400.png`,
        phone_number: faker.phone.number(),
        address: faker.location.streetAddress(true),
        emergency_contact_name: faker.person.fullName(),
        emergency_contact_phone: faker.phone.number(),
        profile_complete: faker.datatype.boolean(0.8),
      };
      createdEmployees.push(employeeData);
    }
  }

  if (createdEmployees.length > 0) {
      const { error: insertError } = await supabase.from('employees').insert(createdEmployees);
      if (insertError) {
        console.error('Error inserting employees:', insertError.message);
      } else {
        console.log(`✅ ${createdEmployees.length} users and employees seeded.`);
      }
  }

  return createdEmployees;
}

async function seedLeaveData(employees: any[]) {
    console.log('🌱 Seeding leave data...');
    if (employees.length === 0) return;

    const leaveRequests = [];
    for (const employee of employees) {
        for (let i = 0; i < faker.number.int({ min: 0, max: 3 }); i++) {
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
    if(leaveRequests.length > 0) {
      await supabase.from('leave_requests').insert(leaveRequests);
      console.log(`✅ ${leaveRequests.length} leave requests seeded.`);
    }
}

async function seedCompanyPosts(employees: any[]) {
    console.log('🌱 Seeding company posts...');
    if (employees.length === 0) return;

    const posts = [];
    for (let i = 0; i < 5; i++) {
        const author = faker.helpers.arrayElement(employees.filter(e => ['admin', 'hr', 'manager'].includes(e.role)));
        posts.push({
            author_id: author.id,
            title: faker.company.catchPhrase(),
            content: faker.lorem.paragraphs(3),
            image_url: `https://placehold.co/600x400.png`
        });
    }
    if(posts.length > 0) {
      await supabase.from('company_posts').insert(posts);
      console.log(`✅ ${posts.length} company posts seeded.`);
    }
}

async function seedHelpdeskTickets(employees: any[]) {
    console.log('🌱 Seeding helpdesk tickets...');
    if (employees.length === 0) return;

    const tickets = [];
    for (let i = 0; i < 15; i++) {
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
    if (tickets.length > 0) {
      await supabase.from('helpdesk_tickets').insert(tickets);
      console.log(`✅ ${tickets.length} helpdesk tickets seeded.`);
    }
}

async function seedAssessments(employees: any[]) {
  console.log('🌱 Seeding assessments and related data...');
  if (employees.length === 0) return;
  
  const assessmentData = [
    { title: 'Customer Support Aptitude Test', process_type: 'Chat Support', passing_score: 75, duration: 30, created_by: employees.find(e => e.role === 'hr')?.id },
    { title: 'Technical Support (Level 1)', process_type: 'Technical Support', passing_score: 80, duration: 45, created_by: employees.find(e => e.role === 'hr')?.id },
    { title: 'Voice Assessment (English)', process_type: 'Voice Process – English', passing_score: 70, duration: 15, created_by: employees.find(e => e.role === 'hr')?.id },
    { title: 'Typing Skill Test', process_type: 'Chat Support', passing_score: 50, duration: 5, created_by: employees.find(e => e.role === 'hr')?.id },
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
  await clearData(); 
  const employees = await seedUsersAndEmployees();
  
  if (employees && employees.length > 0) {
      await Promise.all([
          seedLeaveData(employees),
          seedCompanyPosts(employees),
          seedHelpdeskTickets(employees),
          seedAssessments(employees),
      ]);
  }

  console.log('🎉 Database seeding complete!');
  console.log('---');
  console.log('Sample Logins:');
  console.log('Admin Email: admin@optitalent.com, Password: password');
  console.log('Manager Email: manager@optitalent.com, Password: password');
  
  const sampleEmployee = employees.find(e => e.role === 'employee');
  if(sampleEmployee) {
    console.log(`Employee ID: ${sampleEmployee.employee_id}, Password: password123`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
