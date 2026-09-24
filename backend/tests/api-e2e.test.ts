import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database';

describe('LUMORA Backend End-to-End API Test Suite', () => {
  let customerToken: string;
  let adminToken: string;
  let testProductId: string;
  let testVariantId: string;
  let createdOrderId: string;

  beforeAll(async () => {
    // Get a sample product and variant for testing
    const sampleProduct = await prisma.product.findFirst({
      where: { isActive: true },
      include: { variants: true },
    });
    if (sampleProduct && sampleProduct.variants.length > 0) {
      testProductId = sampleProduct.id;
      testVariantId = sampleProduct.variants[0].id;
    }
  });

  // 1. System Health
  it('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  // 2. Public Products
  it('GET /api/v1/products returns paginated products', async () => {
    const res = await request(app).get('/api/v1/products?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.pagination.total).toBe(65);
  });

  // 3. Categories & Brands
  it('GET /api/v1/categories returns luxury categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.categories.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/brands returns luxury brands', async () => {
    const res = await request(app).get('/api/v1/brands');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.brands.length).toBeGreaterThan(0);
  });

  // 4. Customer Login
  it('POST /api/v1/auth/login logs in customer and returns JWT', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'customer@lumora.com',
      password: 'Customer@123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    customerToken = res.body.data.token;
  });

  // 5. Auth verification
  it('GET /api/v1/auth/me returns authenticated customer profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('customer@lumora.com');
  });

  // 6. Cart Management
  it('POST /api/v1/cart/items adds an item to user cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProductId,
        variantId: testVariantId,
        quantity: 2,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cart.items.length).toBeGreaterThan(0);
  });

  // 7. Coupon Validation
  it('POST /api/v1/coupons/validate calculates coupon discount', async () => {
    const res = await request(app).post('/api/v1/coupons/validate').send({
      code: 'LUMORA10',
      subtotal: 3000,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.coupon.discount).toBe(300);
    expect(res.body.data.coupon.finalAmount).toBe(2700);
  });

  // 8. Order Creation
  it('POST /api/v1/orders places an order and reserves inventory', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shippingAddress: {
          fullName: 'Aria Montgomery',
          phone: '+91 9876543212',
          addressLine1: 'Penthouse 4B, Royale Crest Towers',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400021',
          country: 'India',
        },
        couponCode: 'LUMORA10',
        notes: 'Handle with care: fragile luxury flacons',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.order.orderNumber).toMatch(/^LUM-\d{4}-\d+/);
    createdOrderId = res.body.data.order.id;
  });

  // 9. Payment Flow
  it('POST /api/v1/payments/create-order generates Razorpay order', async () => {
    const res = await request(app)
      .post('/api/v1/payments/create-order')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId: createdOrderId });
    expect(res.status).toBe(200);
    expect(res.body.data.razorpayOrderId).toBeDefined();
  });

  it('POST /api/v1/payments/verify confirms payment', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: createdOrderId,
        razorpayOrderId: 'order_sim_test',
        razorpayPaymentId: 'pay_sim_test',
        razorpaySignature: 'demo_verified',
      });
    expect(res.status).toBe(200);
    expect(res.body.data.payment.status).toBe('PAID');
  });

  // 10. Admin Flow & Security Audit
  it('POST /api/v1/auth/login logs in admin and views dashboard stats', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@lumora.com',
      password: 'Admin@123',
    });
    adminToken = loginRes.body.data.token;

    const dashRes = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data.stats.totalProducts).toBe(65);
    expect(dashRes.body.data.stats.totalRevenue).toBeGreaterThan(0);
  });

  it('records failed login attempt in PostgreSQL with security metadata', async () => {
    const failedRes = await request(app).post('/api/v1/auth/login').send({
      email: 'customer@lumora.com',
      password: 'WrongPassword!999',
    });
    expect(failedRes.status).toBe(401);

    const loggedFail = await prisma.userLoginActivity.findFirst({
      where: { email: 'customer@lumora.com', status: 'FAILED' },
      orderBy: { createdAt: 'desc' },
    });
    expect(loggedFail).toBeDefined();
    expect(loggedFail?.failureReason).toBe('INVALID_PASSWORD');
  });

  it('GET /api/v1/admin/login-activities returns real PostgreSQL login audit logs', async () => {
    const res = await request(app)
      .get('/api/v1/admin/login-activities')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.items[0]).toHaveProperty('status');
    expect(res.body.data.items[0]).toHaveProperty('device');
  });

  it('GET /api/v1/admin/login-activities/stats returns cyber metrics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/login-activities/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalAttempts).toBeGreaterThan(0);
    expect(res.body.data.summary.successRate).toBeDefined();
  });
});

