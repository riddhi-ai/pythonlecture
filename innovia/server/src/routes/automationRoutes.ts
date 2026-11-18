import { Router } from 'express';
import { AutomationController } from '../controllers/automationController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/seed', requireRole('CREATOR'), AutomationController.seedDemoData);
router.post('/run-jobs', requireRole('CREATOR'), AutomationController.runAutomations);
router.post('/quick-add', AutomationController.quickAdd);
router.post('/import-csv', requireRole('CREATOR'), AutomationController.importCSV);

export default router;
