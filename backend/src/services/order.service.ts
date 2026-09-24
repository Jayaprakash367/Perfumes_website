import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { inventoryService } from './inventory.service';
import { couponService } from './coupon.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class OrderService {
  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    return `LUM-${year}-${randomHex}`;
  }

  async createOrder(
    userId: string,
    data: {
      addressId?: string;
      shippingAddress?: any;
      couponCode?: string;
      notes?: string;
    }
  ) {
    // 1. Fetch user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty.', 400, 'EMPTY_CART');
    }

    // 2. Resolve shipping address
    let addressSnapshot = data.shippingAddress;
    if (data.addressId) {
      const dbAddress = await prisma.address.findFirst({
        where: { id: data.addressId, userId },
      });
      if (!dbAddress) throw new AppError('Delivery address not found.', 404, 'ADDRESS_NOT_FOUND');
      addressSnapshot = {
        fullName: dbAddress.fullName,
        phone: dbAddress.phone,
        addressLine1: dbAddress.addressLine1,
        addressLine2: dbAddress.addressLine2,
        city: dbAddress.city,
        state: dbAddress.state,
        postalCode: dbAddress.postalCode,
        country: dbAddress.country,
      };
    }

    if (!addressSnapshot || !addressSnapshot.addressLine1 || !addressSnapshot.city) {
      throw new AppError('A valid delivery address is required.', 400, 'INVALID_ADDRESS');
    }

    // 3. Compute item totals & subtotal
    let subtotal = 0;
    const itemsToProcess = cart.items.map((item) => {
      const unitPrice = item.variant.salePrice ?? item.variant.price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      return {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        variantSize: item.variant.size,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        imageUrl: item.product.images[0]?.url,
      };
    });

    // 4. Coupon discount
    let discount = 0;
    let appliedCouponId: string | null = null;
    if (data.couponCode) {
      const couponResult = await couponService.validateCoupon(data.couponCode, subtotal, userId);
      discount = couponResult.discount;
      appliedCouponId = couponResult.couponId;
    }

    // 5. Shipping & taxes
    const shippingFee = subtotal >= 1500 ? 0 : 100;
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const totalAmount = Math.max(0, subtotal - discount + shippingFee + tax);

    const orderNumber = this.generateOrderNumber();

    // 6. Transactional creation & stock reservation
    const order = await prisma.$transaction(async (tx) => {
      // Reserve stock
      await inventoryService.reserveStock(
        itemsToProcess.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        tx
      );

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressSnapshot,
          subtotal,
          discount,
          shippingFee,
          tax,
          totalAmount,
          currency: 'INR',
          couponId: appliedCouponId,
          orderStatus: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PENDING,
          notes: data.notes,
          items: {
            create: itemsToProcess,
          },
        },
        include: {
          items: true,
          coupon: true,
        },
      });

      // Update coupon usage
      if (appliedCouponId) {
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } },
        });

        await tx.couponUsage.create({
          data: {
            couponId: appliedCouponId,
            userId,
            orderId: newOrder.id,
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      // Create in-app notification
      await tx.notification.create({
        data: {
          userId,
          type: 'ORDER_PLACED',
          title: 'Order Confirmed',
          message: `Your order #${orderNumber} for ₹${totalAmount} has been placed successfully!`,
          metadata: { orderId: newOrder.id, orderNumber },
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'ORDER_CREATED',
          entity: 'Order',
          entityId: newOrder.id,
          metadata: { orderNumber, totalAmount },
        },
      });

      return newOrder;
    });

    return order;
  }

  async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payment: true,
      },
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1 }, brand: true } },
          },
        },
        payment: true,
        coupon: true,
      },
    });

    if (!order) throw new AppError('Order not found.', 404, 'ORDER_NOT_FOUND');
    return order;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) throw new AppError('Order not found.', 404, 'NOT_FOUND');

    if (order.orderStatus === OrderStatus.DELIVERED || order.orderStatus === OrderStatus.CANCELLED) {
      throw new AppError(`Cannot cancel an order with status ${order.orderStatus}.`, 400, 'INVALID_STATUS');
    }

    return prisma.$transaction(async (tx) => {
      // Restore stock
      await inventoryService.restoreStock(
        order.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        tx
      );

      // Update status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: OrderStatus.CANCELLED,
          paymentStatus: order.paymentStatus === PaymentStatus.PAID ? PaymentStatus.REFUNDED : order.paymentStatus,
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId,
          type: 'ORDER_CANCELLED',
          title: 'Order Cancelled',
          message: `Your order #${order.orderNumber} has been cancelled.`,
          metadata: { orderId: order.id },
        },
      });

      return updated;
    });
  }
}

export const orderService = new OrderService();
