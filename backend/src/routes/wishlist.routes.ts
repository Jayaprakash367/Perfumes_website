import { Router } from 'express';
import { wishlistController } from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', wishlistController.get);
router.post('/:productId', wishlistController.addItem);
router.delete('/:productId', wishlistController.removeItem);

export default router;
