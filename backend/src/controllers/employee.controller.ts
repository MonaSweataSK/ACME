import { Request, Response, NextFunction } from 'express';
import { getEmployees, getEmployeeById } from '../services/employee.service';
import type { GetEmployeesQuery } from '../schemas/employee.schema';

export async function listEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getEmployees(req.query as unknown as GetEmployeesQuery);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const employee = await getEmployeeById(id);
    res.status(200).json(employee);
  } catch (err) {
    next(err);
  }
}
