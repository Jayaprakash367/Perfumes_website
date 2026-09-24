import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserPayload } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { ACCESS_COOKIE_NAME } from '../utils/cookies';
import { AppError } from './error.middleware';

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
      // Fallback to cookie
      token = req.cookies[ACCESS_COOKIE_NAME];
    }

    if (!token) {
      throw new AppError('Authentication required. Please sign in.', 401, 'UNAUTHORIZED');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
      token = req.cookies[ACCESS_COOKIE_NAME];
    }

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        req.user = payload;
      } catch {
        // Silently ignore invalid token in optional auth
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: Array<'CUSTOMER' | 'ADMIN' | 'MANAGER'>) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403, 'FORBIDDEN')
      );
    }

    next();
  };
}

export const requireAdmin = requireRole('ADMIN');
export const requireManagerOrAdmin = requireRole('ADMIN', 'MANAGER');
