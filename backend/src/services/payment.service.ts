import crypto from 'crypto';
import { prisma } from '../config/database';
import { razorpay } from '../config/razorpay';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { PaymentStatus, OrderStatus } from '@prisma/client';

export class PaymentService {
  async createRazorpayOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) throw new AppError('Order not found.', 404, 'NOT_FOUND');
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new AppError('This order has already been paid for.', 400, 'ALREADY_PAID');
    }

    const amountInPaise = Math.round(order.totalAmount * 100);

    let providerOrderId: string;

    // Use Razorpay SDK if live keys, else simulated ID for sandbox/demo
    if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_ID.startsWith('rzp_live')) {
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.orderNumber,
        notes: { orderId: order.id, userId },
      });
      providerOrderId = razorpayOrder.id;
    } else {
      // Dev / Test simulation
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.orderNumber,
          notes: { orderId: order.id, userId },
        });
        providerOrderId = rzpOrder.id;
      } catch {
        providerOrderId = `order_sim_${Date.now()}`;
      }
    }

    // Upsert Payment record
    const payment = await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        userId,
        amount: order.totalAmount,
        currency: 'INR',
        provider: 'RAZORPAY',
        providerOrderId,
        status: PaymentStatus.PENDING,
      },
      update: {
        providerOrderId,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      amountInPaise,
      currency: 'INR',
      razorpayOrderId: providerOrderId,
      razorpayKeyId: env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
    };
  }

  async verifyPayment(
    userId: string,
    data: {
      orderId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
  ) {
    const payment = await prisma.payment.findFirst({
      where: { orderId: data.orderId, userId },
      include: { order: true },
    });

    if (!payment) throw new AppError('Payment transaction record not found.', 404, 'NOT_FOUND');

    // Signature verification
    let isSignatureValid = false;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest('hex');

    if (data.razorpaySignature === expectedSignature) {
      isSignatureValid = true;
    } else if (env.NODE_ENV !== 'production' && data.razorpaySignature === 'demo_verified') {
      // Allow demo verification in non-production
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      throw new AppError('Payment signature verification failed.', 400, 'INVALID_SIGNATURE');
    }

    // Update payment & order
    const updated = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          providerPaymentId: data.razorpayPaymentId,
          signature: data.razorpaySignature,
        },
      }),
      prisma.order.update({
        where: { id: data.orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          orderStatus: OrderStatus.PROCESSING,
        },
      }),
      prisma.notification.create({
        data: {
          userId,
          type: 'PAYMENT_SUCCESS',
          title: 'Payment Successful',
          message: `Payment of ₹${payment.amount} received for order #${payment.order.orderNumber}.`,
          metadata: { orderId: data.orderId, paymentId: data.razorpayPaymentId },
        },
      }),
    ]);

    return { success: true, payment: updated[0] };
  }

  async handleWebhook(rawBody: string, signature: string) {
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new AppError('Invalid webhook signature.', 400, 'INVALID_SIGNATURE');
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      const payment = await prisma.payment.findFirst({
        where: { providerOrderId: razorpayOrderId },
      });

      if (payment && payment.status !== PaymentStatus.PAID) {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.PAID,
              providerPaymentId: paymentEntity.id,
              method: paymentEntity.method,
            },
          }),
          prisma.order.update({
            where: { id: payment.orderId },
            data: {
              paymentStatus: PaymentStatus.PAID,
              orderStatus: OrderStatus.PROCESSING,
            },
          }),
        ]);
      }
    }

    return { received: true };
  }
}

export const paymentService = new PaymentService();
