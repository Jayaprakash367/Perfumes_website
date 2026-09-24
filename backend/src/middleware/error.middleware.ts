import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export class AppError extends Error {
  statusCode: number;
  errorCode: string;
  details?: any;

  constructor(message: string, statusCode = 400, errorCode = 'BAD_REQUEST', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): Response | void {
  logger.error({ err, path: req.path, method: req.method }, 'Request error occurred');

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.errorCode, err.details);
  }

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 422, 'Validation failed', 'VALIDATION_ERROR', details);
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const target = err.meta?.target ? (err.meta.target as string[]).join(', ') : 'field';
    return sendError(res, 409, `A record with this ${target} already exists.`, 'DUPLICATE_ENTRY');
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return sendError(res, 404, 'Record not found.', 'NOT_FOUND');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid authentication token.', 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Authentication token expired.', 'TOKEN_EXPIRED');
  }

  // Fallback internal server error
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return sendError(res, 500, message, 'INTERNAL_SERVER_ERROR');
}
