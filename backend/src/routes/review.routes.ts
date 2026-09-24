import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/products/:productId', reviewController.listProductReviews);
router.post('/products/:productId', authenticate, reviewController.addReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

export default router;
