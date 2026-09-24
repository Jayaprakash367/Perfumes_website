import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', orderController.create);
router.get('/', orderController.list);
router.get('/:id', orderController.getById);
router.post('/:id/cancel', orderController.cancel);

export default router;
