import { body } from 'express-validator';

export const validateCreateDepartment = [
  body('name').isString().isLength({ min: 1 }).withMessage('Department name is required'),
];

export const validateUpdateDepartment = [
  body('name').optional().isString().isLength({ min: 1 }),
];
