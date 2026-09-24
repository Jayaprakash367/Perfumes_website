import { Response } from 'express';

interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  error?: {
    code: string;
    details?: any;
  };
}

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errorCode?: string,
  details?: any
): Response {
  const response: ErrorResponse = {
    success: false,
    message,
    ...(errorCode && {
      error: {
        code: errorCode,
        ...(details && { details }),
      },
    }),
  };
  return res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  message: string,
  items: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
): Response {
  return res.status(200).json({
    success: true,
    message,
    data: {
      items,
      pagination,
    },
  });
}
