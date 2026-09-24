import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class ReviewService {
  async listProductReviews(productId: string) {
    return prisma.review.findMany({
      where: { productId, status: 'APPROVED' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addReview(
    userId: string,
    productId: string,
    data: { rating: number; title?: string; comment: string }
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError('Product not found.', 404, 'NOT_FOUND');

    // Check if verified purchaser
    const purchaseCount = await prisma.orderItem.count({
      where: {
        productId,
        order: { userId, paymentStatus: 'PAID' },
      },
    });

    const isVerifiedPurchase = purchaseCount > 0;

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: Math.max(1, Math.min(5, data.rating)),
        title: data.title,
        comment: data.comment,
        isVerifiedPurchase,
        status: 'APPROVED',
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update product average rating & count
    const stats = await prisma.review.aggregate({
      where: { productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAverage: Math.round((stats._avg.rating || 5) * 10) / 10,
        reviewCount: stats._count.rating,
      },
    });

    return review;
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId },
    });

    if (!review) throw new AppError('Review not found.', 404, 'NOT_FOUND');

    await prisma.review.delete({ where: { id: reviewId } });

    // Recalculate rating
    const stats = await prisma.review.aggregate({
      where: { productId: review.productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        ratingAverage: Math.round((stats._avg.rating || 5) * 10) / 10,
        reviewCount: stats._count.rating,
      },
    });
  }
}

export const reviewService = new ReviewService();
