import { prisma } from '../config/database';

export class SearchService {
  async search(query: string, limit = 10) {
    if (!query || query.trim().length === 0) {
      return { products: [], brands: [], categories: [] };
    }

    const q = query.trim();

    const [products, brands, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { fragranceFamily: { contains: q, mode: 'insensitive' } },
            { brand: { name: { contains: q, mode: 'insensitive' } } },
            { category: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        take: limit,
        include: {
          brand: true,
          category: true,
          images: { take: 1 },
          variants: { take: 1 },
        },
      }),
      prisma.brand.findMany({
        where: {
          isActive: true,
          name: { contains: q, mode: 'insensitive' },
        },
        take: 5,
      }),
      prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: q, mode: 'insensitive' },
        },
        take: 5,
      }),
    ]);

    return { products, brands, categories };
  }
}

export const searchService = new SearchService();
