import { z } from 'zod';

export const AnalyticsQuerySchema = z.object({
  departmentId: z.string().uuid('Invalid department ID').optional(),
  countryId: z.string().uuid('Invalid country ID').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
