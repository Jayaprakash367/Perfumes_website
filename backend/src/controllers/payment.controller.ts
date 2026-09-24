import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class PaymentController {
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.body;
      const result = await paymentService.createRazorpayOrder(req.user!.userId, orderId);
      sendSuccess(res, 200, 'Payment order created', result);
    } catch (error) {
      next(error);
    }
  }

  async verify(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await paymentService.verifyPayment(req.user!.userId, req.body);
      sendSuccess(res, 200, 'Payment verified successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      const result = await paymentService.handleWebhook(rawBody, signature);
      sendSuccess(res, 200, 'Webhook processed', result);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
