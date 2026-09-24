import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service';
import { sendSuccess } from '../utils/response';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = (req.query.q as string) || '';
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const results = await searchService.search(q, limit);
      sendSuccess(res, 200, 'Search results', results);
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
