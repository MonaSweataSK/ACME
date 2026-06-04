import { Request, Response, NextFunction } from 'express';
import { getAnalyticsDashboard, getAnalyticsExport } from '../services/analytics.service';
import type { AnalyticsQuery } from '../schemas/analytics.schema';

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getAnalyticsDashboard(req.query as unknown as AnalyticsQuery);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function exportAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const csvContent = await getAnalyticsExport(req.query as unknown as AnalyticsQuery);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics_export.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
}
