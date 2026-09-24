import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateProfileSchema } from '../validators/auth.validator';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getProfile);
router.put('/me', validate(updateProfileSchema), userController.updateProfile);
router.delete('/me', userController.deactivate);

router.get('/recently-viewed', userController.getRecentlyViewed);
router.post('/recently-viewed/:productId', userController.addRecentlyViewed);

export default router;
