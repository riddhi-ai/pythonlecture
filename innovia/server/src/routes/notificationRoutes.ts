import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', NotificationController.getAll);
router.patch('/:id/read', NotificationController.markRead);
router.post('/mark-all-read', NotificationController.markAllRead);
router.get('/digest', NotificationController.getWeeklyDigest);

export default router;
