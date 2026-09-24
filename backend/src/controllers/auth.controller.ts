import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE_NAME } from '../utils/cookies';
import { AuthenticatedRequest } from '../types';
import { parseClientInfo } from '../utils/clientInfo';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientInfo = parseClientInfo(req);
      const { user, accessToken, refreshToken } = await authService.register(req.body, clientInfo);
      setAuthCookies(res, accessToken, refreshToken);
      sendSuccess(res, 201, 'Account created successfully', { user, token: accessToken });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientInfo = parseClientInfo(req);
      const { user, accessToken, refreshToken } = await authService.login(req.body, clientInfo);
      setAuthCookies(res, accessToken, refreshToken);
      sendSuccess(res, 200, 'Signed in successfully', { user, token: accessToken });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies[REFRESH_COOKIE_NAME] || req.body.refreshToken;
      const { accessToken, refreshToken } = await authService.refreshToken(token);
      setAuthCookies(res, accessToken, refreshToken);
      sendSuccess(res, 200, 'Token refreshed successfully', { token: accessToken });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies[REFRESH_COOKIE_NAME] || req.body.refreshToken;
      await authService.logout(token);
      clearAuthCookies(res);
      sendSuccess(res, 200, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, 200, 'Authenticated user profile', { user: req.user });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.forgotPassword(req.body.email);
      sendSuccess(res, 200, 'If an account with that email exists, password reset instructions have been sent.');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      sendSuccess(res, 200, 'Password updated successfully. Please log in with your new password.');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
      sendSuccess(res, 200, 'Password updated successfully.');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
