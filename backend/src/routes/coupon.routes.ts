import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/validate', optionalAuthenticate, orderController.validateCoupon);

export default router;
