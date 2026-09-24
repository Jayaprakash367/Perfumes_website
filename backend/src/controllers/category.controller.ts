import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { sendSuccess } from '../utils/response';

export class CategoryController {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.list();
      sendSuccess(res, 200, 'Categories retrieved', { categories });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.getById(req.params.id as string);
      sendSuccess(res, 200, 'Category detail', { category });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
