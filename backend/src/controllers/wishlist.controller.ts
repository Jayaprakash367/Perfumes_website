import { Response, NextFunction } from 'express';
import { wishlistService } from '../services/wishlist.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class WishlistController {
  async get(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await wishlistService.getWishlist(req.user!.userId);
      sendSuccess(res, 200, 'Wishlist items', { items });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await wishlistService.addItem(req.user!.userId, req.params.productId as string);
      sendSuccess(res, 200, 'Product added to wishlist', { items });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await wishlistService.removeItem(req.user!.userId, req.params.productId as string);
      sendSuccess(res, 200, 'Product removed from wishlist', { items });
    } catch (error) {
      next(error);
    }
  }
}

export const wishlistController = new WishlistController();
