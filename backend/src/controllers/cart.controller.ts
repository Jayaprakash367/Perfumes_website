import { Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class CartController {
  async get(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await cartService.getCart(req.user!.userId);
      sendSuccess(res, 200, 'Cart retrieved', { cart });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId, variantId, quantity = 1 } = req.body;
      const cart = await cartService.addItem(req.user!.userId, {
        productId,
        variantId,
        quantity: parseInt(quantity, 10),
      });
      sendSuccess(res, 200, 'Item added to cart', { cart });
    } catch (error) {
      next(error);
    }
  }

  async updateQuantity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const quantity = parseInt(req.body.quantity, 10);
      const cart = await cartService.updateQuantity(req.user!.userId, req.params.id as string, quantity);
      sendSuccess(res, 200, 'Cart updated', { cart });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await cartService.removeItem(req.user!.userId, req.params.id as string);
      sendSuccess(res, 200, 'Item removed from cart', { cart });
    } catch (error) {
      next(error);
    }
  }

  async clear(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await cartService.clearCart(req.user!.userId);
      sendSuccess(res, 200, 'Cart cleared');
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
