import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findAll() {
  return prisma.department.findMany({
    include: {
      employees: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true,
        }
      }
    }
  });
}

export async function findById(id: string) {
  return prisma.department.findUnique({
    where: { id },
    include: {
      employees: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true,
        }
      }
    }
  });
}

export async function create(data: { name: string }) {
  return prisma.department.create({
    data,
  });
}

export async function update(id: string, data: { name?: string }) {
  return prisma.department.update({
    where: { id },
    data,
  });
}

export async function remove(id: string) {
  return prisma.department.delete({
    where: { id }
  });
}
