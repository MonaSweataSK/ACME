import { Router } from 'express';
import { listEmployees, getEmployee } from '../controllers/employee.controller';
import { validate } from '../middleware/validate';
import { GetEmployeesQuerySchema } from '../schemas/employee.schema';

const router = Router();

// GET /api/employees — paginated, searchable, filterable list
router.get('/', validate(GetEmployeesQuerySchema, 'query'), listEmployees);

// GET /api/employees/:id — full employee profile with salary history
router.get('/:id', getEmployee);

export default router;
