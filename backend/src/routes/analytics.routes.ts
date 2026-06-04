import { Router } from 'express';
import { getAnalytics, exportAnalytics } from '../controllers/analytics.controller';
import { validate } from '../middleware/validate';
import { AnalyticsQuerySchema } from '../schemas/analytics.schema';

const router = Router();

// GET /api/analytics
router.get('/', validate(AnalyticsQuerySchema, 'query'), getAnalytics);

// GET /api/analytics/export
router.get('/export', validate(AnalyticsQuerySchema, 'query'), exportAnalytics);

export default router;
