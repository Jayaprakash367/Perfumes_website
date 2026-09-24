# LUMORA Haute Parfumerie — Backend API

Production-ready backend API service for **LUMORA**, the luxury perfume e-commerce platform.

---

## 🛠️ Technology Stack

- **Runtime & Language:** Node.js (v20+), TypeScript (v5.6+)
- **Framework:** Express.js (v4.21+)
- **Database:** PostgreSQL (v16+) via **Prisma ORM** (v5.22+)
- **Caching:** Redis via **ioredis** (with non-blocking offline fallback)
- **Authentication:** JWT (HMAC-SHA256) with HTTP-only cookies + token rotation
- **Password Hashing:** Argon2id
- **Validation:** Zod schemas
- **Payment Gateway:** Razorpay SDK + HMAC-SHA256 signature verification & webhooks
- **Logging:** Pino + Pino HTTP (structured JSON logging with sensitive data redaction)
- **Testing:** Vitest + Supertest

---

## 🚀 Quick Start Guide

### 1. Database Setup
PostgreSQL is configured on localhost:5432:
```env
DATABASE_URL=postgresql://lumora:lumora_secret@localhost:5432/lumora_db?schema=public
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Generate Prisma Client & Migrate
```bash
npx prisma generate
npx prisma db push
```

### 4. Seed the Database
Populates all 65 luxury perfumes, 15 prestigious brands, 20 categories, fragrance notes, variants, coupons, and test users:
```bash
npm run seed
```

### 5. Start the Development Server
```bash
npm run dev
```
The server starts at: **`http://localhost:5000`**  
API Base URL: **`http://localhost:5000/api/v1`**  
Health Check: **`http://localhost:5000/health`**

---

## 🔑 Default Seed Accounts

| Role | Email | Password | Privileges |
|---|---|---|---|
| **Admin** | `admin@lumora.com` | `Admin@123` | Full dashboard, analytics, product/order/user CRUD |
| **Manager** | `manager@lumora.com` | `Manager@123` | Dashboard overview, order updates, stock inspection |
| **Customer** | `customer@lumora.com` | `Customer@123` | Catalog browsing, cart, checkout, orders, reviews |

---

## 📡 Core API Endpoints

### 🔐 Authentication (`/api/v1/auth`)
- `POST /register` — Create account with password hashing
- `POST /login` — Authenticate and receive JWT + HTTP-only cookies
- `POST /refresh` — Rotate refresh token and get new access token
- `POST /logout` — Revoke session and clear cookies
- `GET /me` — Current authenticated user profile
- `POST /forgot-password` — Password reset token generation
- `POST /reset-password` — Reset password using token
- `PUT /change-password` — Change password for logged-in user

### 🧴 Products & Catalog (`/api/v1`)
- `GET /products` — List perfumes with filter (brand, category, price, gender), sort, and search
- `GET /products/:id` — Single product details with variants, images, notes & reviews
- `GET /products/slug/:slug` — Lookup product by slug
- `GET /products/featured` — Featured perfumes
- `GET /products/bestsellers` — Best-selling flacons
- `GET /products/new-arrivals` — New seasonal arrivals
- `GET /products/:id/related` — Related perfumes by category or brand
- `GET /categories` — All fragrance categories
- `GET /brands` — All luxury perfume houses
- `GET /search?q={query}` — Unified search across products, brands, and categories

### 🛒 Cart & Wishlist (`/api/v1`)
- `GET /cart` — Get user's cart with computed subtotals
- `POST /cart/items` — Add variant to cart with stock validation
- `PUT /cart/items/:id` — Update item quantity
- `DELETE /cart/items/:id` — Remove item from cart
- `DELETE /cart` — Clear entire cart
- `GET /wishlist` — Retrieve saved perfumes
- `POST /wishlist/:productId` — Add perfume to wishlist
- `DELETE /wishlist/:productId` — Remove perfume from wishlist

### 🎟️ Coupons & Orders (`/api/v1`)
- `POST /coupons/validate` — Validate discount code (`LUMORA10`, `FIRSTLUX`, `VIP20`)
- `POST /orders` — Place order (interactive transaction, pessimistic stock reservation)
- `GET /orders` — List authenticated user's order history
- `GET /orders/:id` — Order details
- `POST /orders/:id/cancel` — Cancel order & restore inventory

### 💳 Payments (`/api/v1/payments`)
- `POST /create-order` — Create Razorpay payment order
- `POST /verify` — Verify HMAC-SHA256 signature and update order status
- `POST /webhook` — Idempotent webhook listener for payment capture & refunds

### 🛡️ Admin Management (`/api/v1/admin`)
- `GET /dashboard` — Revenue, total orders, customers, products, and low stock alerts
- `GET /orders` — Paginated admin view of all customer orders
- `PUT /orders/:id/status` — Update order status (PROCESSING, SHIPPED, DELIVERED)
- `PUT /orders/:id/tracking` — Update tracking number
- `POST /products` — Create new luxury flacon
- `PUT /products/:id` — Edit perfume details
- `DELETE /products/:id` — Deactivate perfume
- `GET /users` — Paginated user directory

---

## 🧪 Automated Testing

Run the Vitest integration suite:
```bash
npm test
```
Runs 12 comprehensive end-to-end integration tests covering Health, Catalog, Auth, Cart, Coupons, Orders, Payments, and Admin flows.
