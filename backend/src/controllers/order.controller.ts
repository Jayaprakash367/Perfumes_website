import { Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { couponService } from '../services/coupon.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class OrderController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.createOrder(req.user!.userId, req.body);
      sendSuccess(res, 201, 'Order created successfully', { order });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await orderService.getUserOrders(req.user!.userId);
      sendSuccess(res, 200, 'Orders retrieved', { orders });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.getOrderById(req.user!.userId, req.params.id as string);
      sendSuccess(res, 200, 'Order details', { order });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.cancelOrder(req.user!.userId, req.params.id as string);
      sendSuccess(res, 200, 'Order cancelled successfully', { order });
    } catch (error) {
      next(error);
    }
  }

  async validateCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, subtotal } = req.body;
      const result = await couponService.validateCoupon(code, subtotal, req.user?.userId);
      sendSuccess(res, 200, 'Coupon applied successfully', { coupon: result });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
