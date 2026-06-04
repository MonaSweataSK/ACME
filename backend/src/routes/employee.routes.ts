import { Router } from 'express';
import { listEmployees, getEmployee, createEmployeeHandler, updateEmployeeHandler } from '../controllers/employee.controller';
import { validate } from '../middleware/validate';
import { GetEmployeesQuerySchema, CreateEmployeeSchema, UpdateEmployeeSchema } from '../schemas/employee.schema';

const router = Router();

// GET /api/employees — paginated, searchable, filterable list
router.get('/', validate(GetEmployeesQuerySchema, 'query'), listEmployees);

// GET /api/employees/:id — full employee profile with salary history
router.get('/:id', getEmployee);

// POST /api/employees — create new employee with initial salary (atomic transaction)
router.post('/', validate(CreateEmployeeSchema), createEmployeeHandler);

// PUT /api/employees/:id — modify basic administrative corporate configuration
router.put('/:id', validate(UpdateEmployeeSchema), updateEmployeeHandler);

export default router;
