
import { Request, Response, NextFunction } from 'express';
import * as employeeService from './employee.service';

export const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employees = await employeeService.findAllEmployees();
        res.status(200).json(employees);
    } catch (error) {
        next(error);
    }
};

export const getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employee = await employeeService.findEmployeeById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (error) {
        next(error);
    }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newEmployee = await employeeService.createEmployee(req.body);
        res.status(201).json(newEmployee);
    } catch (error) {
        next(error);
    }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedEmployee = await employeeService.updateEmployee(req.params.id, req.body);
        res.status(200).json(updatedEmployee);
    } catch (error) {
        next(error);
    }
};

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await employeeService.deleteEmployee(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
