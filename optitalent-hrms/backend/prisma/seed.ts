
import { PrismaClient, EmploymentStatus, Gender, ShiftType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log(`Start seeding ...`);

  // --- Clean up existing data ---
  console.log('Cleaning database...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.trainingProgress.deleteMany();
  await prisma.trainingModule.deleteMany();
  await prisma.coachingSession.deleteMany();
  await prisma.qAReview.deleteMany();
  await prisma.qAForm.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.employeeShift.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.role.deleteMany();
  await prisma.department.deleteMany();
  console.log('Database cleaned.');

  // --- Seed Roles ---
  console.log('Seeding roles...');
  const roles = await prisma.role.createManyAndReturn({
    data: [
      { name: 'Admin', description: 'Full system access' },
      { name: 'HR', description: 'Human Resources management' },
      { name: 'Ops Manager', description: 'Operations management' },
      { name: 'Trainer', description: 'Training and development' },
      { name: 'Employee', description: 'Standard employee access' },
      { name: 'IT', description: 'IT support and management' },
      { name: 'Finance', description: 'Payroll and finance management' },
      { name: 'QA', description: 'Quality assurance' },
    ],
  });
  console.log(`Seeded ${roles.length} roles.`);
  const adminRole = roles.find(r => r.name === 'Admin')!;
  const employeeRole = roles.find(r => r.name === 'Employee')!;

  // --- Seed Departments ---
  console.log('Seeding departments...');
  const departments = await prisma.department.createManyAndReturn({
    data: [
      { name: 'Executive' },
      { name: 'Engineering' },
      { name: 'Human Resources' },
      { name: 'Operations' },
      { name: 'Finance' },
      { name: 'IT' },
      { name: 'Quality Assurance' },
      { name: 'Training' },
    ],
  });
  console.log(`Seeded ${departments.length} departments.`);
  const engineeringDept = departments.find(d => d.name === 'Engineering')!;

  // --- Seed Employees ---
  console.log('Seeding employees...');
  const hashedPassword = await bcrypt.hash('Password123!', SALT_ROUNDS);

  const adminEmployee = await prisma.employee.create({
    data: {
      employeeId: 'EMP001',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@optitalent.com',
      password: hashedPassword,
      jobTitle: 'System Administrator',
      hireDate: new Date(),
      employmentStatus: EmploymentStatus.ACTIVE,
      department: { connect: { id: departments.find(d => d.name === 'Executive')!.id } },
      role: { connect: { id: adminRole.id } },
    }
  })
  
  const employeesData = Array.from({ length: 50 }).map((_, i) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      employeeId: `EMP${String(i + 2).padStart(3, '0')}`,
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }),
      password: hashedPassword,
      jobTitle: faker.person.jobTitle(),
      hireDate: faker.date.past({ years: 5 }),
      employmentStatus: faker.helpers.arrayElement(Object.values(EmploymentStatus)),
      gender: faker.helpers.arrayElement(Object.values(Gender)),
      dob: faker.date.birthdate(),
      departmentId: faker.helpers.arrayElement(departments).id,
      roleId: employeeRole.id, // Default to employee role
      managerId: adminEmployee.id, // Assign admin as manager for simplicity
    };
  });

  await prisma.employee.createMany({
    data: employeesData,
  });
  console.log(`Seeded 50 employees.`);

  // --- Seed Leave Types for different countries ---
  console.log('Seeding leave types...');
  await prisma.leaveType.createMany({
    data: [
      { name: 'Sick Leave', country: 'IN', daysAllowed: 12 },
      { name: 'Casual Leave', country: 'IN', daysAllowed: 12 },
      { name: 'Paid Leave', country: 'IN', daysAllowed: 20 },
      { name: 'Sick Leave', country: 'US', daysAllowed: 10 },
      { name: 'Paid Time Off (PTO)', country: 'US', daysAllowed: 25 },
      { name: 'Sick Leave', country: 'PH', daysAllowed: 15 },
      { name: 'Vacation Leave', country: 'PH', daysAllowed: 15 },
    ],
  });
  console.log('Seeded leave types.');

  // --- Seed an example QA Form ---
  console.log('Seeding QA Form...');
  await prisma.qAForm.create({
    data: {
      name: 'Standard Customer Service QA Form',
      structure: {
        sections: [
          {
            title: "Opening",
            questions: [
              { label: "Used appropriate greeting", score: 5 },
              { label: "Verified customer identity", score: 10 }
            ]
          },
          {
            title: "Resolution",
            questions: [
              { label: "Accurately identified the issue", score: 25 },
              { label: "Provided correct solution", score: 40 }
            ]
          },
          {
            title: "Closing",
            questions: [
              { label: "Summarized the resolution", score: 10 },
              { label: "Used appropriate closing", score: 10 }
            ]
          }
        ]
      }
    }
  })
  console.log('Seeded QA Form.');


  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
