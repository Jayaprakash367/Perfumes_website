import { Request } from 'express';

export interface UserPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'MANAGER';
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ProductGender = 'MEN' | 'WOMEN' | 'UNISEX';
export type NoteType = 'TOP' | 'MIDDLE' | 'BASE';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'RAZORPAY' | 'COD' | 'CARD' | 'UPI';
export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
