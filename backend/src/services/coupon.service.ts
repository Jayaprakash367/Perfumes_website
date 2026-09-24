import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class CouponService {
  async validateCoupon(code: string, subtotal: number, userId?: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or expired coupon code.', 400, 'INVALID_COUPON');
    }

    const now = new Date();
    if (coupon.startDate > now) {
      throw new AppError('This coupon is not active yet.', 400, 'COUPON_NOT_STARTED');
    }
    if (coupon.expiryDate && coupon.expiryDate < now) {
      throw new AppError('This coupon has expired.', 400, 'COUPON_EXPIRED');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('This coupon usage limit has been reached.', 400, 'USAGE_LIMIT_REACHED');
    }

    if (subtotal < coupon.minimumOrderValue) {
      throw new AppError(
        `Minimum order value of ₹${coupon.minimumOrderValue} required for this coupon.`,
        400,
        'MINIMUM_ORDER_NOT_MET'
      );
    }

    if (userId) {
      const userUsageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUsageCount >= coupon.perUserLimit) {
        throw new AppError('You have already redeemed this coupon the maximum allowed times.', 400, 'USER_LIMIT_EXCEEDED');
      }
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }

    return {
      couponId: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discount: Math.round(discount),
      finalAmount: Math.max(0, subtotal - Math.round(discount)),
    };
  }
}

export const couponService = new CouponService();
