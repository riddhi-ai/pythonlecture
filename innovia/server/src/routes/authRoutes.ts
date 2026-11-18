import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema, registerSchema, inviteMemberSchema } from '@innovia/shared';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.get('/me', authenticate, AuthController.me);
router.post(
  '/invite',
  authenticate,
  requireRole('CREATOR'),
  validateBody(inviteMemberSchema),
  AuthController.invite
);

export default router;
