
import { Router } from 'express';
import { protect, authorize } from '@/middleware/authHandler';
import { validate } from '@/middleware/validate';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from './employee.controller';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.dto';

const router = Router();

// Protect all routes in this file
router.use(protect);

router.route('/')
  .get(authorize('Admin', 'HR'), getAllEmployees)
  .post(authorize('Admin', 'HR'), validate(createEmployeeSchema), createEmployee);

router.route('/:id')
  .get(authorize('Admin', 'HR'), getEmployeeById)
  .put(authorize('Admin', 'HR'), validate(updateEmployeeSchema), updateEmployee)
  .delete(authorize('Admin'), deleteEmployee);

export default router;
