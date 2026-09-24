import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

export class InventoryService {
  async reserveStock(
    items: Array<{ variantId: string; quantity: number }>,
    tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
  ) {
    for (const item of items) {
      // Pessimistic check
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (!variant || !variant.isActive) {
        throw new AppError(`Item variant ${item.variantId} is not available.`, 400, 'UNAVAILABLE_ITEM');
      }

      if (variant.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${variant.size}. Only ${variant.stock} remaining.`, 400, 'STOCK_DEFICIT');
      }

      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  async restoreStock(
    items: Array<{ variantId: string; quantity: number }>,
    tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
  ) {
    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }
}

export const inventoryService = new InventoryService();
