import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isEmailVerified: true,
        createdAt: true,
        addresses: true,
      },
    });

    if (!user) throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatar?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        updatedAt: true,
      },
    });
  }

  async deactivateAccount(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
    // Revoke all tokens
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async getRecentlyViewed(userId: string) {
    const list = await prisma.recentlyViewedProduct.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 12,
      include: {
        product: {
          include: {
            images: { take: 1 },
            brand: true,
            variants: true,
          },
        },
      },
    });
    return list.map((item) => item.product);
  }

  async recordRecentlyViewed(userId: string, productId: string) {
    return prisma.recentlyViewedProduct.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      create: { userId, productId },
      update: { viewedAt: new Date() },
    });
  }
}

export const userService = new UserService();
