import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory.
 * Usage: router.post('/', validate(MySchema), controller)
 * Validates req.body by default; pass a target to validate query/params.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(result.error);
      return;
    }
    // Replace with parsed (coerced/typed) data
    req[target] = result.data;
    next();
  };
}
