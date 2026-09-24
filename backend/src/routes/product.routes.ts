import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validate } from '../middleware/validation.middleware';
import { productQuerySchema } from '../validators/product.validator';

const router = Router();

router.get('/', validate(productQuerySchema), productController.list);
router.get('/featured', productController.getFeatured);
router.get('/bestsellers', productController.getBestSellers);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/slug/:slug', productController.getBySlug);
router.get('/:id', productController.getById);
router.get('/:id/related', productController.getRelated);

export default router;
