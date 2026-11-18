import { Router } from 'express';
import { CollabController } from '../controllers/collabController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, authorizeCollaborationAccess } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { collaborationSchema } from '@innovia/shared';

const router = Router();

router.use(authenticate);

router.get('/', CollabController.getAll);
router.get('/:id', authorizeCollaborationAccess, CollabController.getById);
router.post('/', requireRole('CREATOR'), validateBody(collaborationSchema), CollabController.create);
router.put('/:id', authorizeCollaborationAccess, CollabController.update);
router.delete('/:id', requireRole('CREATOR'), CollabController.delete);

router.patch(
  '/:id/deliverables/:deliverableId/toggle',
  authorizeCollaborationAccess,
  CollabController.toggleDeliverable
);
router.post('/:id/briefs', authorizeCollaborationAccess, CollabController.addBrief);
router.post('/:id/comments', authorizeCollaborationAccess, CollabController.addComment);

export default router;
