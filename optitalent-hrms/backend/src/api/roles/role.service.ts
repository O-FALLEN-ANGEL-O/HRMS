import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findAll() {
  return prisma.role.findMany({
    include: {
      employees: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    }
  });
}

export async function findById(id: string) {
  return prisma.role.findUnique({
    where: { id },
    include: {
      employees: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    }
  });
}

export async function create(data: { name: string; description?: string }) {
  return prisma.role.create({
    data,
  });
}

export async function update(id: string, data: { name?: string; description?: string }) {
  return prisma.role.update({
    where: { id },
    data,
  });
}

export async function remove(id: string) {
  return prisma.role.delete({
    where: { id }
  });
}
