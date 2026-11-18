import { Router } from 'express';
import { ScrapbookController } from '../controllers/scrapbookController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', ScrapbookController.getItems);
router.post('/batch', ScrapbookController.saveItems);

export default router;
