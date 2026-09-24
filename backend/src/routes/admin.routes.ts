import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, requireManagerOrAdmin, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireManagerOrAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Orders
router.get('/orders', adminController.listOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.put('/orders/:id/tracking', adminController.updateTracking);

// Products
router.post('/products', requireAdmin, adminController.createProduct);
router.put('/products/:id', requireAdmin, adminController.updateProduct);
router.delete('/products/:id', requireAdmin, adminController.deleteProduct);

// Users & Activity Audit
router.get('/login-activities', requireAdmin, adminController.listLoginActivities);
router.get('/login-activities/stats', requireAdmin, adminController.getLoginActivityStats);
router.get('/users', requireAdmin, adminController.listUsers);
router.put('/users/:id/status', requireAdmin, adminController.toggleUserStatus);

export default router;
