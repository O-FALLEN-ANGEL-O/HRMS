import { Request, Response } from 'express';
import * as roleService from './role.service';

export async function getAllRoles(req: Request, res: Response) {
  try {
    const roles = await roleService.findAll();
    res.status(200).json(roles);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getRoleById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const role = await roleService.findById(id);
    res.status(200).json(role);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function createRole(req: Request, res: Response) {
  try {
    const roleData = req.body;
    const role = await roleService.create(roleData);
    res.status(201).json(role);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function updateRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const roleData = req.body;
    const role = await roleService.update(id, roleData);
    res.status(200).json(role);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function deleteRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const role = await roleService.remove(id);
    res.status(200).json({ message: 'Role deleted successfully', role });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
