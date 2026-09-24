import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';
import { getPaginationParams } from '../utils/pagination';
import { slugify } from '../utils/slug';

export class AdminController {
  async getDashboardStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalOrders,
        paidOrdersAgg,
        totalCustomers,
        totalProducts,
        recentOrders,
        lowStockVariants,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({
          where: { paymentStatus: 'PAID' },
          _sum: { totalAmount: true },
        }),
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.product.count({ where: { isActive: true } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            items: { take: 2 },
          },
        }),
        prisma.productVariant.findMany({
          where: {
            isActive: true,
            stock: { lte: 10 },
          },
          take: 10,
          include: { product: { select: { name: true, sku: true } } },
        }),
      ]);

      sendSuccess(res, 200, 'Admin dashboard statistics', {
        stats: {
          totalRevenue: paidOrdersAgg._sum.totalAmount || 0,
          totalOrders,
          totalCustomers,
          totalProducts,
        },
        recentOrders,
        lowStockVariants,
      });
    } catch (error) {
      next(error);
    }
  }

  async listOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = getPaginationParams(req, 20);
      const status = req.query.status as any;
      const where: any = {};
      if (status) where.orderStatus = status;

      const [items, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip: pagination.skip,
          take: pagination.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
            items: true,
            payment: true,
          },
        }),
        prisma.order.count({ where }),
      ]);

      sendPaginated(res, 'Admin orders', items, {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const order = await prisma.order.update({
        where: { id: req.params.id as string },
        data: { orderStatus: status },
      });

      // Notification to user
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: 'ORDER_STATUS_UPDATE',
          title: 'Order Status Updated',
          message: `Your order #${order.orderNumber} status changed to ${status}.`,
          metadata: { orderId: order.id, status },
        },
      });

      sendSuccess(res, 200, 'Order status updated', { order });
    } catch (error) {
      next(error);
    }
  }

  async updateTracking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { trackingNumber, estimatedDelivery } = req.body;
      const order = await prisma.order.update({
        where: { id: req.params.id as string },
        data: {
          trackingNumber,
          estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
          orderStatus: 'SHIPPED',
        },
      });

      sendSuccess(res, 200, 'Tracking updated', { order });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, brandId, categoryId, basePrice, description, sku, variants, images } = req.body;
      const slug = `${slugify(name)}-${Date.now()}`;

      const product = await prisma.product.create({
        data: {
          name,
          slug,
          brandId,
          categoryId,
          basePrice,
          description,
          sku,
          variants: variants ? { create: variants } : undefined,
          images: images ? { create: images } : undefined,
        },
      });

      sendSuccess(res, 201, 'Product created successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await prisma.product.update({
        where: { id: req.params.id as string },
        data: req.body,
      });
      sendSuccess(res, 200, 'Product updated', { product });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.product.update({
        where: { id: req.params.id as string },
        data: { isActive: false },
      });
      sendSuccess(res, 200, 'Product deactivated');
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = getPaginationParams(req, 20);
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip: pagination.skip,
          take: pagination.limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            _count: { select: { orders: true } },
          },
        }),
        prisma.user.count(),
      ]);

      sendPaginated(res, 'Users list', users, {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      });
    } catch (error) {
      next(error);
    }
  }

  async listLoginActivities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = getPaginationParams(req, 20);
      const status = req.query.status as string;
      const search = req.query.search as string;

      const where: any = {};
      if (status && (status === 'SUCCESS' || status === 'FAILED')) {
        where.status = status;
      }
      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { email: { contains: query, mode: 'insensitive' } },
          { ipAddress: { contains: query, mode: 'insensitive' } },
          { user: { name: { contains: query, mode: 'insensitive' } } },
        ];
      }

      const [activities, total] = await Promise.all([
        prisma.userLoginActivity.findMany({
          where,
          skip: pagination.skip,
          take: pagination.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                isActive: true,
              },
            },
          },
        }),
        prisma.userLoginActivity.count({ where }),
      ]);

      sendPaginated(res, 'User login activities', activities, {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      });
    } catch (error) {
      next(error);
    }
  }

  async getLoginActivityStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [
        totalAttempts,
        successCount,
        failedCount,
        todayAttempts,
        todaySuccess,
        recentFailed,
        recentActivities,
      ] = await Promise.all([
        prisma.userLoginActivity.count(),
        prisma.userLoginActivity.count({ where: { status: 'SUCCESS' } }),
        prisma.userLoginActivity.count({ where: { status: 'FAILED' } }),
        prisma.userLoginActivity.count({ where: { createdAt: { gte: oneDayAgo } } }),
        prisma.userLoginActivity.count({ where: { status: 'SUCCESS', createdAt: { gte: oneDayAgo } } }),
        prisma.userLoginActivity.findMany({
          where: { status: 'FAILED' },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.userLoginActivity.findMany({
          take: 8,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true, email: true, role: true },
            },
          },
        }),
      ]);

      const successRate = totalAttempts > 0 ? Math.round((successCount / totalAttempts) * 100) : 100;

      sendSuccess(res, 200, 'Login activity metrics', {
        summary: {
          totalAttempts,
          successCount,
          failedCount,
          successRate,
          todayAttempts,
          todaySuccess,
          recentFailedCount: recentFailed.length,
        },
        recentActivities,
        flaggedThreats: recentFailed,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        throw new AppError('isActive field must be a boolean', 400);
      }

      const targetUser = await prisma.user.findUnique({ where: { id: id as string } });
      if (!targetUser) {
        throw new AppError('User not found', 404);
      }

      if (targetUser.id === req.user?.userId) {
        throw new AppError('You cannot deactivate your own administrative account.', 400);
      }

      const updated = await prisma.user.update({
        where: { id: id as string },
        data: { isActive },
        select: { id: true, name: true, email: true, role: true, isActive: true, updatedAt: true },
      });

      if (!isActive) {
        await prisma.refreshToken.updateMany({
          where: { userId: id as string },
          data: { isRevoked: true },
        });
      }

      sendSuccess(res, 200, `User account ${isActive ? 'activated' : 'deactivated'} successfully`, { user: updated });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();

