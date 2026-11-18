import { Router } from 'express';
import { ContentController } from '../controllers/contentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { contentSchema } from '@innovia/shared';

const router = Router();

router.use(authenticate);

router.get('/', ContentController.getAll);
router.get('/:id', ContentController.getById);
router.post('/', requireRole('CREATOR', 'TEAM_MEMBER'), validateBody(contentSchema), ContentController.create);
router.put('/:id', requireRole('CREATOR', 'TEAM_MEMBER'), ContentController.update);
router.delete('/:id', requireRole('CREATOR'), ContentController.delete);

export default router;
