import { Router } from 'express';
import { ExpenseController } from '../controllers/expenseController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { expenseSchema, paymentSchema } from '@innovia/shared';

const router = Router();

router.use(authenticate);

// Expenses (Only Creator & Team Member)
router.get('/', requireRole('CREATOR', 'TEAM_MEMBER'), ExpenseController.getAll);
router.post(
  '/',
  requireRole('CREATOR', 'TEAM_MEMBER'),
  validateBody(expenseSchema),
  ExpenseController.create
);
router.put('/:id', requireRole('CREATOR'), ExpenseController.update);
router.delete('/:id', requireRole('CREATOR'), ExpenseController.delete);
router.patch('/:id/approval', requireRole('CREATOR'), ExpenseController.setApproval);

// Recurring Subscriptions
router.get('/recurring', requireRole('CREATOR'), ExpenseController.getRecurring);
router.post('/recurring', requireRole('CREATOR'), ExpenseController.createRecurring);

// Payments & Payouts
router.get('/payments', requireRole('CREATOR', 'TEAM_MEMBER'), ExpenseController.getPayments);
router.patch('/payments/:id/status', requireRole('CREATOR'), ExpenseController.updatePaymentStatus);

export default router;
