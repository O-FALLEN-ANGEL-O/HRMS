import { Router } from 'express';
import * as employeeController from './employee.controller';

const router = Router();

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);

export default router;
