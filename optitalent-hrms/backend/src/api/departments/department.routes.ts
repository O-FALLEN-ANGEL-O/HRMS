
import { Router } from 'express';
import * as departmentController from './department.controller';
import { validateCreateDepartment, validateUpdateDepartment } from './department.dto';

const router = Router();

router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post('/', validateCreateDepartment, departmentController.createDepartment);
router.put('/:id', validateUpdateDepartment, departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

export default router;
