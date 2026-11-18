import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { requireFinancialAccess } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireFinancialAccess);

router.get('/summary', AnalyticsController.getSummary);
router.get('/comparisons', AnalyticsController.getComparisons);
router.get('/charts', AnalyticsController.getChartsData);
router.get('/insights', AnalyticsController.getInsights);
router.get('/export', AnalyticsController.exportReport);

export default router;
