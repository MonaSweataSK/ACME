import { z } from 'zod';

export const GetEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  countryId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  sortBy: z.enum(['firstName', 'joinDate', 'totalCtc']).default('firstName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type GetEmployeesQuery = z.infer<typeof GetEmployeesQuerySchema>;

export const CreateEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  departmentId: z.string().uuid('Invalid department ID'),
  designationId: z.string().uuid('Invalid designation ID'),
  countryId: z.string().uuid('Invalid country ID'),
  joinDate: z.coerce.date(),
  initialSalary: z.object({
    baseSalary: z.number().positive('Base salary must be positive'),
    bonus: z.number().min(0).default(0),
    allowances: z.number().min(0).default(0),
    effectiveDate: z.coerce.date(),
    reason: z.string().min(1, 'Reason is required'),
  }),
});

export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
