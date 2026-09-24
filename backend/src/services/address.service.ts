import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class AddressService {
  async listUserAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, data: any) {
    if (data.isDefault) {
      // Remove current default
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If first address, automatically make it default
    const count = await prisma.address.count({ where: { userId } });
    const isDefault = data.isDefault || count === 0;

    return prisma.address.create({
      data: {
        ...data,
        userId,
        isDefault,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, data: any) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) throw new AppError('Address not found.', 404, 'NOT_FOUND');

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) throw new AppError('Address not found.', 404, 'NOT_FOUND');

    await prisma.address.delete({ where: { id: addressId } });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) throw new AppError('Address not found.', 404, 'NOT_FOUND');

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);
  }
}

export const addressService = new AddressService();
