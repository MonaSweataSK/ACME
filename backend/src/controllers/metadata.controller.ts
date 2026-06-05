import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function getDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const departments = await prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    res.status(200).json(departments);
  } catch (err) {
    next(err);
  }
}

export async function getDesignations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { departmentId } = req.query;
    const where = departmentId ? { department_id: departmentId as string } : {};
    
    const designations = await prisma.designation.findMany({
      where,
      select: { id: true, name: true, department_id: true },
      orderBy: { name: 'asc' },
    });
    res.status(200).json(designations);
  } catch (err) {
    next(err);
  }
}

export async function getCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const countries = await prisma.country.findMany({
      select: { id: true, name: true, currency_code: true },
      orderBy: { name: 'asc' },
    });
    res.status(200).json(countries);
  } catch (err) {
    next(err);
  }
}
