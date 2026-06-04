import { z } from 'zod';

export const CreateSalaryRevisionSchema = z.object({
  effectiveDate: z.coerce.date(),
  baseSalary: z.number().positive('Base salary must be positive'),
  bonus: z.number().min(0).default(0),
  allowances: z.number().min(0).default(0),
  reason: z.string().min(1, 'Reason is required'),
});

export type CreateSalaryRevision = z.infer<typeof CreateSalaryRevisionSchema>;
