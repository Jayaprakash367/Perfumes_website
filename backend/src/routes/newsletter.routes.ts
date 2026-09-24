import { Router } from 'express';
import { newsletterController } from '../controllers/newsletter.controller';

const router = Router();

router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);

export default router;
