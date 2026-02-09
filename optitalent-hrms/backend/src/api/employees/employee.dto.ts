
import { body } from 'express-validator';

export const validateCreateEmployee = [
  body('employeeId').isString().isLength({ min: 1 }).withMessage('Employee ID is required'),
  body('firstName').isString().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').isString().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isString(),
  body('dob').optional().isISO8601().toDate(),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']),
  body('hireDate').isISO8601().toDate().withMessage('Hire date is required'),
  body('jobTitle').isString().isLength({ min: 1 }).withMessage('Job title is required'),
  body('employmentStatus').isIn(['PROBATION', 'ACTIVE', 'NOTICE_PERIOD', 'RESIGNED', 'TERMINATED']),
  body('roleId').isString().withMessage('Role ID is required'),
  body('departmentId').isString().withMessage('Department ID is required'),
  body('managerId').optional().isString(),
];

export const validateUpdateEmployee = [
  body('employeeId').optional().isString().isLength({ min: 1 }),
  body('firstName').optional().isString().isLength({ min: 1 }),
  body('lastName').optional().isString().isLength({ min: 1 }),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('dob').optional().isISO8601().toDate(),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']),
  body('hireDate').optional().isISO8601().toDate(),
  body('jobTitle').optional().isString().isLength({ min: 1 }),
  body('employmentStatus').optional().isIn(['PROBATION', 'ACTIVE', 'NOTICE_PERIOD', 'RESIGNED', 'TERMINATED']),
  body('roleId').optional().isString(),
  body('departmentId').optional().isString(),
  body('managerId').optional().isString(),
];
