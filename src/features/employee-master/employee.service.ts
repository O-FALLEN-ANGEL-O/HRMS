
import prisma from '@/config/prisma';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.dto';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10');

export const findAllEmployees = async () => {
  return prisma.employee.findMany({
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      jobTitle: true,
      employmentStatus: true,
      department: { select: { name: true } },
      role: { select: { name: true } },
    }
  });
};

export const findEmployeeById = async (id: string) => {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      role: true,
      manager: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });
};

export const createEmployee = async (data: CreateEmployeeDto) => {
    const { password, ...restData } = data;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newEmployee = await prisma.employee.create({
        data: {
            ...restData,
            password: hashedPassword,
        },
    });

    const { password: _, ...employeeWithoutPassword } = newEmployee;
    return employeeWithoutPassword;
};

export const updateEmployee = async (id: string, data: UpdateEmployeeDto) => {
  const updatedEmployee = await prisma.employee.update({
    where: { id },
    data,
  });
  const { password: _, ...employeeWithoutPassword } = updatedEmployee;
  return employeeWithoutPassword;
};

export const deleteEmployee = async (id: string) => {
  // Instead of deleting, we can mark as terminated for data integrity
  return prisma.employee.update({
    where: { id },
    data: {
      employmentStatus: 'TERMINATED',
    },
  });
};
