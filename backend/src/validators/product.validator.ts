import { z } from 'zod';

export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    gender: z.enum(['MEN', 'WOMEN', 'UNISEX']).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    sortBy: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'name_asc']).optional(),
    search: z.string().optional(),
    isFeatured: z.string().optional(),
    isBestSeller: z.string().optional(),
    isNewArrival: z.string().optional(),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().min(5),
    shortDescription: z.string().optional(),
    brandId: z.string().uuid(),
    categoryId: z.string().uuid(),
    gender: z.enum(['MEN', 'WOMEN', 'UNISEX']).default('UNISEX'),
    fragranceFamily: z.string().optional(),
    concentration: z.string().optional(),
    countryOfOrigin: z.string().optional(),
    ingredients: z.string().optional(),
    basePrice: z.number().positive(),
    salePrice: z.number().positive().optional(),
    sku: z.string().min(3),
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    variants: z.array(
      z.object({
        size: z.string(),
        price: z.number().positive(),
        salePrice: z.number().positive().optional(),
        sku: z.string(),
        stock: z.number().int().nonnegative().default(10),
      })
    ).optional(),
    images: z.array(
      z.object({
        url: z.string(),
        altText: z.string().optional(),
        isPrimary: z.boolean().optional(),
      })
    ).optional(),
  }),
});
