import { Router } from 'express';
import * as roleController from './role.controller';
import { validateCreateRole, validateUpdateRole } from './role.dto';

const router = Router();

router.get('/', roleController.getAllRoles);
router.get('/:id', roleController.getRoleById);
router.post('/', validateCreateRole, roleController.createRole);
router.put('/:id', validateUpdateRole, roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

export default router;
