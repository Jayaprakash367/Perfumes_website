import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { PaginationParams, PaginatedResult } from '../types';

export class ProductService {
  async list(filters: any, pagination: PaginationParams): Promise<PaginatedResult<any>> {
    const where: any = { isActive: true };

    if (filters.category) {
      where.OR = [
        { category: { slug: filters.category } },
        { category: { name: { contains: filters.category, mode: 'insensitive' } } },
      ];
    }

    if (filters.brand) {
      where.brand = {
        OR: [
          { slug: filters.brand },
          { name: { contains: filters.brand, mode: 'insensitive' } },
        ],
      };
    }

    if (filters.gender) {
      where.gender = filters.gender;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.basePrice = {};
      if (filters.minPrice) where.basePrice.gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) where.basePrice.lte = parseFloat(filters.maxPrice);
    }

    if (filters.isFeatured === 'true') where.isFeatured = true;
    if (filters.isBestSeller === 'true') where.isBestSeller = true;
    if (filters.isNewArrival === 'true') where.isNewArrival = true;

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { fragranceFamily: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filters.sortBy === 'price_asc') orderBy = { basePrice: 'asc' };
    else if (filters.sortBy === 'price_desc') orderBy = { basePrice: 'desc' };
    else if (filters.sortBy === 'rating') orderBy = { ratingAverage: 'desc' };
    else if (filters.sortBy === 'name_asc') orderBy = { name: 'asc' };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy,
        include: {
          brand: true,
          category: true,
          images: { orderBy: { position: 'asc' } },
          variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
          fragranceNotes: { include: { fragranceNote: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
        fragranceNotes: { include: { fragranceNote: true } },
        reviews: {
          where: { status: 'APPROVED' },
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) throw new AppError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
    return product;
  }

  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
        fragranceNotes: { include: { fragranceNote: true } },
        reviews: {
          where: { status: 'APPROVED' },
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) throw new AppError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
    return product;
  }

  async getFeatured(limit = 8) {
    return prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: limit,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
      },
      orderBy: { ratingAverage: 'desc' },
    });
  }

  async getBestSellers(limit = 8) {
    return prisma.product.findMany({
      where: { isBestSeller: true, isActive: true },
      take: limit,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
      },
      orderBy: { reviewCount: 'desc' },
    });
  }

  async getNewArrivals(limit = 8) {
    return prisma.product.findMany({
      where: { isNewArrival: true, isActive: true },
      take: limit,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRelated(productId: string, limit = 4) {
    const current = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, brandId: true },
    });
    if (!current) return [];

    return prisma.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        OR: [{ categoryId: current.categoryId }, { brandId: current.brandId }],
      },
      take: limit,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
      },
      orderBy: { ratingAverage: 'desc' },
    });
  }
}

export const productService = new ProductService();
