import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function validateUser(email: string, pass: string) {
  const employee = await prisma.employee.findUnique({
    where: { email },
    include: { role: true, department: true }
  });

  if (!employee) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(pass, employee.password);

  if (!isPasswordValid) {
    return null;
  }

  return employee;
}
