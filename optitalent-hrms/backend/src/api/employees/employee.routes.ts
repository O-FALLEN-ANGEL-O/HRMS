
import { Router } from 'express';
import * as employeeController from './employee.controller';
import { validateCreateEmployee, validateUpdateEmployee } from './employee.dto';

const router = Router();

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', validateCreateEmployee, employeeController.createEmployee);
router.put('/:id', validateUpdateEmployee, employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

export default router;
