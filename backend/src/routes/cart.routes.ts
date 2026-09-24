import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', cartController.get);
router.post('/items', cartController.addItem);
router.put('/items/:id', cartController.updateQuantity);
router.delete('/items/:id', cartController.removeItem);
router.delete('/', cartController.clear);

export default router;
