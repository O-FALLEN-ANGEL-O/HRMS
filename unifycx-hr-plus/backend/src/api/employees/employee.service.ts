
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findAll() {
  return prisma.employee.findMany({
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      jobTitle: true,
      employmentStatus: true,
      department: {
        select: { name: true }
      },
      role: {
        select: { name: true }
      }
    }
  });
}

export async function findById(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      role: true,
      manager: {
        select: {
          firstName: true,
          lastName: true,
        }
      }
    },
  });
}
