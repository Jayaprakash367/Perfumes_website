import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class CategoryService {
  async list() {
    return prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          take: 12,
          include: {
            images: { take: 1 },
            brand: true,
            variants: true,
          },
        },
      },
    });
    if (!category) throw new AppError('Category not found.', 404, 'CATEGORY_NOT_FOUND');
    return category;
  }
}

export const categoryService = new CategoryService();
