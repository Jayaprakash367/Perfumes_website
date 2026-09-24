import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class WishlistService {
  private async getOrCreateWishlist(userId: string) {
    let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId } });
    }
    return wishlist;
  }

  async getWishlist(userId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const items = await prisma.wishlistItem.findMany({
      where: { wishlistId: wishlist.id },
      include: {
        product: {
          include: {
            images: { take: 1 },
            brand: true,
            variants: { take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((i) => i.product);
  }

  async addItem(userId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError('Product not found.', 404, 'NOT_FOUND');

    await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
      create: {
        wishlistId: wishlist.id,
        productId,
      },
      update: {},
    });

    return this.getWishlist(userId);
  }

  async removeItem(userId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);
    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });
    return this.getWishlist(userId);
  }
}

export const wishlistService = new WishlistService();
