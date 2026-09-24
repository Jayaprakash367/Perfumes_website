import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class CartService {
  private async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          include: {
            images: { take: 1 },
            brand: true,
          },
        },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let subtotal = 0;
    const formattedItems = items.map((item) => {
      const price = item.variant.salePrice ?? item.variant.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSlug: item.product.slug,
        brandName: item.product.brand.name,
        imageUrl: item.product.images[0]?.url,
        variantId: item.variantId,
        variantSize: item.variant.size,
        price,
        originalPrice: item.variant.price,
        quantity: item.quantity,
        stock: item.variant.stock,
        itemTotal,
      };
    });

    return {
      id: cart.id,
      items: formattedItems,
      itemCount: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      subtotal,
    };
  }

  async addItem(userId: string, data: { productId: string; variantId: string; quantity: number }) {
    const cart = await this.getOrCreateCart(userId);

    // Verify product and variant
    const variant = await prisma.productVariant.findFirst({
      where: { id: data.variantId, productId: data.productId, isActive: true },
      include: { product: true },
    });

    if (!variant || !variant.product.isActive) {
      throw new AppError('The requested perfume variant is not available.', 404, 'VARIANT_NOT_FOUND');
    }

    if (variant.stock < data.quantity) {
      throw new AppError(`Only ${variant.stock} units available in stock.`, 400, 'INSUFFICIENT_STOCK');
    }

    // Check existing item in cart
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: data.variantId,
        },
      },
    });

    if (existing) {
      const newQty = existing.quantity + data.quantity;
      if (variant.stock < newQty) {
        throw new AppError(`Only ${variant.stock} units available in stock.`, 400, 'INSUFFICIENT_STOCK');
      }
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId,
          quantity: data.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { variant: true },
    });

    if (!item) throw new AppError('Cart item not found.', 404, 'NOT_FOUND');

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      if (item.variant.stock < quantity) {
        throw new AppError(`Only ${item.variant.stock} units available in stock.`, 400, 'INSUFFICIENT_STOCK');
      }
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}

export const cartService = new CartService();
