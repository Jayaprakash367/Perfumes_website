import { Request, Response, NextFunction } from 'express';
import { brandService } from '../services/brand.service';
import { sendSuccess } from '../utils/response';

export class BrandController {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brands = await brandService.list();
      sendSuccess(res, 200, 'Brands retrieved', { brands });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brand = await brandService.getById(req.params.id as string);
      sendSuccess(res, 200, 'Brand detail', { brand });
    } catch (error) {
      next(error);
    }
  }
}

export const brandController = new BrandController();
