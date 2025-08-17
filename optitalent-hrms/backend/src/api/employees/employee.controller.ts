import { Request, Response, NextFunction } from 'express';
import * as employeeService from './employee.service';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

export async function getAllEmployees(req: Request, res: Response, next: NextFunction) {
  try {
    const employees = await employeeService.findAll();
    res.status(200).json(employees);
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const employee = await employeeService.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const employeeData = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    employeeData.password = hashedPassword;

    const employee = await employeeService.create(employeeData);
    const { password, ...employeeWithoutPassword } = employee;
    
    res.status(201).json({
      message: 'Employee created successfully',
      employee: employeeWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const updateData = req.body;

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const employee = await employeeService.update(id, updateData);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { password, ...employeeWithoutPassword } = employee;
    res.status(200).json({
      message: 'Employee updated successfully',
      employee: employeeWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const employee = await employeeService.remove(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
}
