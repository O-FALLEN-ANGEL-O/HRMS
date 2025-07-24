import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { validationResult } from 'express-validator';
import { generateToken } from '../../utils/jwt';

export async function login(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const employee = await authService.validateUser(email, password);
    
    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(employee.id, employee.role.name);
    
    // Omit password from the response
    const { password: _, ...employeeData } = employee;

    res.status(200).json({
      message: 'Login successful',
      token,
      employee: employeeData,
    });
  } catch (error) {
    next(error);
  }
}
