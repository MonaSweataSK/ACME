import { Request, Response, NextFunction } from 'express';
import { addSalaryRevision } from '../services/salary.service';
import type { CreateSalaryRevision } from '../schemas/salary.schema';

export async function createSalaryRevisionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const result = await addSalaryRevision(id, req.body as CreateSalaryRevision);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
