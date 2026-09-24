import { PrismaClient, Role, Gender, NoteType, DiscountType } from '@prisma/client';
import argon2 from 'argon2';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function main() {
  console.log('🌱 Starting LUMORA Database Seeding...');

  // 1. Clean existing records in correct relation order
  console.log('Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.recentlyViewedProduct.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productFragranceNote.deleteMany();
  await prisma.fragranceNote.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.address.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();

  // 2. Create Users
  console.log('Creating users...');
  const adminPasswordHash = await argon2.hash('Admin@123');
  const managerPasswordHash = await argon2.hash('Manager@123');
  const customerPasswordHash = await argon2.hash('Customer@123');

  const admin = await prisma.user.create({
    data: {
      name: 'LUMORA Administrator',
      email: 'admin@lumora.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
      phone: '+91 9876543210',
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'LUMORA Manager',
      email: 'manager@lumora.com',
      passwordHash: managerPasswordHash,
      role: Role.MANAGER,
      isEmailVerified: true,
      phone: '+91 9876543211',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Aria Montgomery',
      email: 'customer@lumora.com',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      isEmailVerified: true,
      phone: '+91 9876543212',
    },
  });

  // Create demo address for customer
  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: 'Aria Montgomery',
      phone: '+91 9876543212',
      addressLine1: 'Penthouse 4B, Royale Crest Towers',
      addressLine2: 'Marine Drive, Nariman Point',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400021',
      country: 'India',
      isDefault: true,
    },
  });

  // Create Cart & Wishlist for customer
  await prisma.cart.create({ data: { userId: customer.id } });
  await prisma.wishlist.create({ data: { userId: customer.id } });

  // 3. Create Brands
  console.log('Creating luxury brands...');
  const brandList = [
    { name: 'Maison Francis Kurkdjian', country: 'France', website: 'https://franciskurkdjian.com' },
    { name: 'Tom Ford', country: 'United States', website: 'https://tomford.com' },
    { name: 'Creed', country: 'France', website: 'https://creedfragrance.com' },
    { name: 'Dior', country: 'France', website: 'https://dior.com' },
    { name: 'Chanel', country: 'France', website: 'https://chanel.com' },
    { name: 'Byredo', country: 'Sweden', website: 'https://byredo.com' },
    { name: 'Diptyque', country: 'France', website: 'https://diptyqueparis.com' },
    { name: 'Kilian Paris', country: 'France', website: 'https://bykilian.com' },
    { name: 'Yves Saint Laurent', country: 'France', website: 'https://ysl.com' },
    { name: 'Parfums de Marly', country: 'France', website: 'https://parfums-de-marly.com' },
    { name: 'Roja Parfums', country: 'United Kingdom', website: 'https://rojaparfums.com' },
    { name: 'Xerjoff', country: 'Italy', website: 'https://xerjoff.com' },
    { name: 'Amouage', country: 'Oman', website: 'https://amouage.com' },
    { name: 'Le Labo', country: 'United States', website: 'https://lelabofragrances.com' },
    { name: 'Jo Malone London', country: 'United Kingdom', website: 'https://jomalone.com' },
  ];

  const brandMap = new Map<string, string>();
  for (const b of brandList) {
    const brand = await prisma.brand.create({
      data: {
        name: b.name,
        slug: slugify(b.name),
        description: `Exquisite haute parfumerie from ${b.name}, crafting iconic olfactive masterpieces.`,
        country: b.country,
        website: b.website,
      },
    });
    brandMap.set(b.name, brand.id);
  }

  // 4. Load seed-data.json
  const seedDataPath = path.resolve(__dirname, 'seed-data.json');
  const rawData = fs.readFileSync(seedDataPath, 'utf-8');
  const { products: rawProducts, categories: rawCategories, promoCodes: rawPromoCodes } = JSON.parse(rawData);

  // 5. Create Categories
  console.log('Creating categories...');
  const categoryMap = new Map<string, string>();
  for (const catName of rawCategories) {
    if (catName === 'All') continue;
    const cat = await prisma.category.create({
      data: {
        name: catName,
        slug: slugify(catName),
        description: `Indulge in our curated selection of ${catName.toLowerCase()} luxury fragrances.`,
      },
    });
    categoryMap.set(catName, cat.id);
  }

  // Ensure fallback category if needed
  let defaultCategory = categoryMap.get('Luxury Prestige');
  if (!defaultCategory) {
    const fallback = await prisma.category.create({
      data: {
        name: 'Luxury Prestige',
        slug: 'luxury-prestige',
        description: 'Elite haute perfumery.',
      },
    });
    defaultCategory = fallback.id;
    categoryMap.set('Luxury Prestige', fallback.id);
  }

  // Helper to extract or create fragrance note
  const noteCache = new Map<string, string>();
  async function getOrCreateNote(name: string, type: NoteType): Promise<string> {
    const cleanName = name.trim();
    if (!cleanName) return '';
    if (noteCache.has(cleanName)) return noteCache.get(cleanName)!;

    const existing = await prisma.fragranceNote.findUnique({ where: { name: cleanName } });
    if (existing) {
      noteCache.set(cleanName, existing.id);
      return existing.id;
    }

    const note = await prisma.fragranceNote.create({
      data: { name: cleanName, type },
    });
    noteCache.set(cleanName, note.id);
    return note.id;
  }

  // 6. Create Products
  console.log(`Seeding ${rawProducts.length} luxury products...`);
  const brandsArray = Array.from(brandMap.values());

  for (let i = 0; i < rawProducts.length; i++) {
    const p = rawProducts[i];
    const categoryId = categoryMap.get(p.category) || defaultCategory;
    const brandId = brandsArray[i % brandsArray.length];

    // Determine gender
    let gender: Gender = Gender.UNISEX;
    const lowerName = (p.name + ' ' + (p.description || '')).toLowerCase();
    if (lowerName.includes('femme') || lowerName.includes('rose') || lowerName.includes('women')) {
      gender = Gender.WOMEN;
    } else if (lowerName.includes('homme') || lowerName.includes('woody') || lowerName.includes('cedar') || lowerName.includes('vetiver')) {
      gender = Gender.MEN;
    }

    const skuBase = `LUM-${(p.name || 'PERF').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}-${p.id}`;

    const createdProduct = await prisma.product.create({
      data: {
        name: p.name,
        slug: `${slugify(p.name)}-${p.id}`,
        description: p.description,
        shortDescription: p.subtitle || `${p.name} - Luxury Fragrance`,
        brandId,
        categoryId,
        gender,
        fragranceFamily: p.category,
        concentration: p.subtitle?.includes('Extrait') ? 'Extrait De Parfum' : 'Eau De Parfum',
        countryOfOrigin: 'France',
        ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citronellol.',
        basePrice: p.price,
        salePrice: p.originalPrice > p.price ? p.price : undefined,
        sku: skuBase,
        ratingAverage: p.rating || 4.9,
        reviewCount: p.reviewsCount || 120,
        isFeatured: i < 8,
        isBestSeller: Boolean(p.isBestseller),
        isNewArrival: Boolean(p.isNew),
        isActive: true,
      },
    });

    // Create Image
    if (p.image) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: p.image,
          altText: `${p.name} luxury bottle`,
          position: 0,
          isPrimary: true,
        },
      });
    }

    // Create Variants (50ml, 100ml, 200ml)
    const variants = [
      { size: '50 ML', price: Math.round(p.price * 0.7), salePrice: Math.round((p.originalPrice || p.price) * 0.7), stock: 45 },
      { size: '100 ML', price: p.price, salePrice: p.originalPrice || undefined, stock: 75 },
      { size: '200 ML', price: Math.round(p.price * 1.65), salePrice: Math.round((p.originalPrice || p.price) * 1.65), stock: 25 },
    ];

    for (const v of variants) {
      await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          size: v.size,
          price: v.price,
          salePrice: v.salePrice > v.price ? v.price : undefined,
          sku: `${skuBase}-${v.size.replace(/\s+/g, '')}`,
          stock: v.stock,
          isActive: true,
        },
      });
    }

    // Process Fragrance Notes
    if (p.topNotes) {
      const topNoteList = p.topNotes.split(',').map((s: string) => s.trim());
      for (const noteName of topNoteList) {
        const noteId = await getOrCreateNote(noteName, NoteType.TOP);
        if (noteId) {
          await prisma.productFragranceNote.upsert({
            where: { productId_fragranceNoteId: { productId: createdProduct.id, fragranceNoteId: noteId } },
            create: { productId: createdProduct.id, fragranceNoteId: noteId },
            update: {},
          });
        }
      }
    }

    if (p.heartNotes) {
      const heartNoteList = p.heartNotes.split(',').map((s: string) => s.trim());
      for (const noteName of heartNoteList) {
        const noteId = await getOrCreateNote(noteName, NoteType.MIDDLE);
        if (noteId) {
          await prisma.productFragranceNote.upsert({
            where: { productId_fragranceNoteId: { productId: createdProduct.id, fragranceNoteId: noteId } },
            create: { productId: createdProduct.id, fragranceNoteId: noteId },
            update: {},
          });
        }
      }
    }

    if (p.baseNotes) {
      const baseNoteList = p.baseNotes.split(',').map((s: string) => s.trim());
      for (const noteName of baseNoteList) {
        const noteId = await getOrCreateNote(noteName, NoteType.BASE);
        if (noteId) {
          await prisma.productFragranceNote.upsert({
            where: { productId_fragranceNoteId: { productId: createdProduct.id, fragranceNoteId: noteId } },
            create: { productId: createdProduct.id, fragranceNoteId: noteId },
            update: {},
          });
        }
      }
    }
  }

  // 7. Create Coupons
  console.log('Creating coupons...');
  for (const [code, val] of Object.entries(rawPromoCodes) as [string, any][]) {
    await prisma.coupon.create({
      data: {
        code,
        description: val.description,
        discountType: DiscountType.PERCENTAGE,
        discountValue: val.discountPercent,
        minimumOrderValue: 999,
        maximumDiscount: 2000,
        usageLimit: 500,
        perUserLimit: 3,
        isActive: true,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });
  }

  // 8. Newsletter demo subscriber
  await prisma.newsletterSubscriber.create({
    data: {
      email: 'customer@lumora.com',
      isActive: true,
    },
  });

  console.log('✅ LUMORA Database Seed Completed Successfully!');
  console.log('----------------------------------------------------');
  console.log('Admin Account:    admin@lumora.com / Admin@123');
  console.log('Manager Account:  manager@lumora.com / Manager@123');
  console.log('Customer Account: customer@lumora.com / Customer@123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
