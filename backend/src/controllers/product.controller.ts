import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { getPaginationParams } from '../utils/pagination';
import { sendPaginated, sendSuccess } from '../utils/response';

export class ProductController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = getPaginationParams(req, 12);
      const result = await productService.list(req.query, pagination);
      sendPaginated(res, 'Products retrieved successfully', result.items, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getById(req.params.id as string);
      sendSuccess(res, 200, 'Product details', { product });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getBySlug(req.params.slug as string);
      sendSuccess(res, 200, 'Product details', { product });
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getFeatured();
      sendSuccess(res, 200, 'Featured products', { products });
    } catch (error) {
      next(error);
    }
  }

  async getBestSellers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getBestSellers();
      sendSuccess(res, 200, 'Best seller products', { products });
    } catch (error) {
      next(error);
    }
  }

  async getNewArrivals(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getNewArrivals();
      sendSuccess(res, 200, 'New arrival products', { products });
    } catch (error) {
      next(error);
    }
  }

  async getRelated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getRelated(req.params.id as string);
      sendSuccess(res, 200, 'Related products', { products });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
