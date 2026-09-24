import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getProfile(req.user!.userId);
      sendSuccess(res, 200, 'User profile', { user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, 200, 'Profile updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.deactivateAccount(req.user!.userId);
      sendSuccess(res, 200, 'Account deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRecentlyViewed(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await userService.getRecentlyViewed(req.user!.userId);
      sendSuccess(res, 200, 'Recently viewed products', { products });
    } catch (error) {
      next(error);
    }
  }

  async addRecentlyViewed(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.recordRecentlyViewed(req.user!.userId, req.params.productId as string);
      sendSuccess(res, 200, 'Product added to recently viewed');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
