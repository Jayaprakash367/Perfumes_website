import { Request } from 'express';
import { PaginationParams } from '../types';

export function getPaginationParams(req: Request, defaultLimit = 12, maxLimit = 100): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(req.query.limit as string, 10) || defaultLimit)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
