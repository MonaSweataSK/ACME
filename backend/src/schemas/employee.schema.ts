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
