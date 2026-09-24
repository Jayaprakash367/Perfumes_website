import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class BrandService {
  async list() {
    return prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          take: 12,
          include: {
            images: { take: 1 },
            category: true,
            variants: true,
          },
        },
      },
    });
    if (!brand) throw new AppError('Brand not found.', 404, 'BRAND_NOT_FOUND');
    return brand;
  }
}

export const brandService = new BrandService();
