import { Request, Response, NextFunction } from 'express';
import * as employeeService from './employee.service';

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
