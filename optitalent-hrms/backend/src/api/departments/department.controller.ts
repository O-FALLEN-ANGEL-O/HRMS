import { Request, Response, NextFunction } from 'express';
import * as departmentService from './department.service';
import { validationResult } from 'express-validator';

export async function getAllDepartments(req: Request, res: Response, next: NextFunction) {
  try {
    const departments = await departmentService.findAll();
    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
}

export async function getDepartmentById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const department = await departmentService.findById(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json(department);
  } catch (error) {
    next(error);
  }
}

export async function createDepartment(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const department = await departmentService.create(req.body);
    res.status(201).json({
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDepartment(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const department = await departmentService.update(id, req.body);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json({
      message: 'Department updated successfully',
      department,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const department = await departmentService.remove(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
}
