import { Router } from 'express';
import { createSalaryRevisionHandler } from '../controllers/salary.controller';
import { validate } from '../middleware/validate';
import { CreateSalaryRevisionSchema } from '../schemas/salary.schema';

const router = Router();

// POST /api/employees/:id/salary
router.post('/:id/salary', validate(CreateSalaryRevisionSchema), createSalaryRevisionHandler);

export default router;
