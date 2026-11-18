import { Router } from 'express';
import { TaskController } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, authorizeTaskAccess } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { taskSchema } from '@innovia/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole('CREATOR', 'TEAM_MEMBER'));

router.get('/', TaskController.getAll);
router.post('/', validateBody(taskSchema), TaskController.create);
router.put('/:id', authorizeTaskAccess, TaskController.update);
router.delete('/:id', requireRole('CREATOR'), TaskController.delete);

// Timer & time tracking
router.post('/:id/timer/start', authorizeTaskAccess, TaskController.startTimer);
router.post('/:id/timer/stop', authorizeTaskAccess, TaskController.stopTimer);
router.post('/:id/time/manual', authorizeTaskAccess, TaskController.logManualTime);
router.get('/time/logs', TaskController.getTimeLogs);

export default router;
