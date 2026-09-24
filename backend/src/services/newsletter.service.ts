import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class NewsletterService {
  async subscribe(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (!existing.isActive) {
        return prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { isActive: true, unsubscribedAt: null },
        });
      }
      return existing;
    }

    return prisma.newsletterSubscriber.create({
      data: { email: cleanEmail },
    });
  }

  async unsubscribe(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });
    if (!existing) throw new AppError('Subscriber not found.', 404, 'NOT_FOUND');

    return prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data: { isActive: false, unsubscribedAt: new Date() },
    });
  }
}

export const newsletterService = new NewsletterService();
