import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { searchLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.get('/', searchLimiter, searchController.search);

export default router;
