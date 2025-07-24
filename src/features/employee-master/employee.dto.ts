
import { z } from 'zod';
import { EmploymentStatus } from '@prisma/client';

export const createEmployeeSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  jobTitle: z.string(),
  hireDate: z.string().datetime(),
  departmentId: z.string().uuid(),
  roleId: z.string().uuid(),
  managerId: z.string().uuid().optional(),
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  employmentStatus: z.nativeEnum(EmploymentStatus).optional(),
  departmentId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
