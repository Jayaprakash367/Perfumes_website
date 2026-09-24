import { Router } from 'express';
import { brandController } from '../controllers/brand.controller';

const router = Router();

router.get('/', brandController.list);
router.get('/:id', brandController.getById);

export default router;
