import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response, next: NextFunction): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
