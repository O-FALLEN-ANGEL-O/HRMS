import { body } from 'express-validator';

export const validateCreateRole = [
  body('name').isString().isLength({ min: 1 }).withMessage('Role name is required'),
  body('description').optional().isString(),
];

export const validateUpdateRole = [
  body('name').optional().isString().isLength({ min: 1 }),
  body('description').optional().isString(),
];
