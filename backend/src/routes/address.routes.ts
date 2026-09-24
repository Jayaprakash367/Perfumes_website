import { Router } from 'express';
import { addressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { addressSchema } from '../validators/auth.validator';

const router = Router();

router.use(authenticate);

router.get('/', addressController.list);
router.post('/', validate(addressSchema), addressController.create);
router.put('/:id', validate(addressSchema), addressController.update);
router.delete('/:id', addressController.delete);
router.put('/:id/default', addressController.setDefault);

export default router;
