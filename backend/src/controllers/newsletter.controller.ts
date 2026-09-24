import { Request, Response, NextFunction } from 'express';
import { newsletterService } from '../services/newsletter.service';
import { sendSuccess } from '../utils/response';

export class NewsletterController {
  async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await newsletterService.subscribe(email);
      sendSuccess(res, 200, 'Thank you for subscribing to LUMORA Luxury Olfactive updates.');
    } catch (error) {
      next(error);
    }
  }

  async unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await newsletterService.unsubscribe(email);
      sendSuccess(res, 200, 'You have been unsubscribed from our newsletter.');
    } catch (error) {
      next(error);
    }
  }
}

export const newsletterController = new NewsletterController();
