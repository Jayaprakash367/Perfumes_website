import { CookieOptions, Response } from 'express';
import { env } from '../config/env';

export const REFRESH_COOKIE_NAME = 'lumora_refresh_token';
export const ACCESS_COOKIE_NAME = 'lumora_access_token';

const cookieDefaults: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, {
    ...cookieDefaults,
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...cookieDefaults,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE_NAME, cookieDefaults);
  res.clearCookie(REFRESH_COOKIE_NAME, cookieDefaults);
}
