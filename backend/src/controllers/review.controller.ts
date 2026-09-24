import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class ReviewController {
  async listProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await reviewService.listProductReviews(req.params.productId as string);
      sendSuccess(res, 200, 'Reviews retrieved', { reviews });
    } catch (error) {
      next(error);
    }
  }

  async addReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.addReview(req.user!.userId, req.params.productId as string, req.body);
      sendSuccess(res, 201, 'Review submitted successfully', { review });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await reviewService.deleteReview(req.user!.userId, req.params.id as string);
      sendSuccess(res, 200, 'Review deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
