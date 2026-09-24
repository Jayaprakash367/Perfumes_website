import argon2 from 'argon2';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateRandomToken } from '../utils/crypto';
import { UserPayload } from '../types';
import { ClientDeviceInfo } from '../utils/clientInfo';

export class AuthService {
  async register(
    data: { name: string; email: string; password: string; phone?: string },
    clientInfo?: ClientDeviceInfo
  ) {
    const cleanEmail = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await argon2.hash(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: data.phone?.trim() || null,
        cart: { create: {} },
        wishlist: { create: {} },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });

    const payload: UserPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(user.id);

    // Save refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Record initial registration in UserLoginActivity
    try {
      await prisma.userLoginActivity.create({
        data: {
          userId: user.id,
          email: user.email,
          status: 'SUCCESS',
          failureReason: 'INITIAL_REGISTRATION',
          ipAddress: clientInfo?.ipAddress || null,
          userAgent: clientInfo?.userAgent || null,
          device: clientInfo?.device || null,
          browser: clientInfo?.browser || null,
          os: clientInfo?.os || null,
        },
      });
    } catch (logErr) {
      console.error('Failed to log registration activity:', logErr);
    }

    return { user, accessToken, refreshToken };
  }

  async login(
    data: { email: string; password: string },
    clientInfo?: ClientDeviceInfo
  ) {
    const cleanEmail = data.email.toLowerCase().trim();

    // 1. Cyber Threat Protection: Check recent failed attempts (Brute-force protection)
    const recentFailedAttempts = await prisma.userLoginActivity.count({
      where: {
        email: cleanEmail,
        status: 'FAILED',
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });

    if (recentFailedAttempts >= 5) {
      await prisma.userLoginActivity.create({
        data: {
          email: cleanEmail,
          status: 'FAILED',
          failureReason: 'RATE_LIMIT_EXCEEDED_BRUTE_FORCE_BLOCKED',
          ipAddress: clientInfo?.ipAddress || null,
          userAgent: clientInfo?.userAgent || null,
          device: clientInfo?.device || null,
          browser: clientInfo?.browser || null,
          os: clientInfo?.os || null,
        },
      });
      throw new AppError(
        'Too many failed login attempts detected. For your security, this account is temporarily locked for 15 minutes.',
        429,
        'ACCOUNT_TEMPORARILY_LOCKED'
      );
    }

    // 2. Fetch user from PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Record failed login in PostgreSQL
      await prisma.userLoginActivity.create({
        data: {
          email: cleanEmail,
          status: 'FAILED',
          failureReason: 'USER_NOT_FOUND',
          ipAddress: clientInfo?.ipAddress || null,
          userAgent: clientInfo?.userAgent || null,
          device: clientInfo?.device || null,
          browser: clientInfo?.browser || null,
          os: clientInfo?.os || null,
        },
      });
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    // 3. Check account activation
    if (!user.isActive) {
      await prisma.userLoginActivity.create({
        data: {
          userId: user.id,
          email: cleanEmail,
          status: 'FAILED',
          failureReason: 'ACCOUNT_DEACTIVATED',
          ipAddress: clientInfo?.ipAddress || null,
          userAgent: clientInfo?.userAgent || null,
          device: clientInfo?.device || null,
          browser: clientInfo?.browser || null,
          os: clientInfo?.os || null,
        },
      });
      throw new AppError(
        'Your account has been deactivated. Please contact support.',
        403,
        'ACCOUNT_DEACTIVATED'
      );
    }

    // 4. Verify password with Argon2
    const isValidPassword = await argon2.verify(user.passwordHash, data.password);
    if (!isValidPassword) {
      await prisma.userLoginActivity.create({
        data: {
          userId: user.id,
          email: cleanEmail,
          status: 'FAILED',
          failureReason: 'INVALID_PASSWORD',
          ipAddress: clientInfo?.ipAddress || null,
          userAgent: clientInfo?.userAgent || null,
          device: clientInfo?.device || null,
          browser: clientInfo?.browser || null,
          os: clientInfo?.os || null,
        },
      });
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    // 5. Successful login: Record activity in PostgreSQL
    await prisma.userLoginActivity.create({
      data: {
        userId: user.id,
        email: user.email,
        status: 'SUCCESS',
        failureReason: null,
        ipAddress: clientInfo?.ipAddress || null,
        userAgent: clientInfo?.userAgent || null,
        device: clientInfo?.device || null,
        browser: clientInfo?.browser || null,
        os: clientInfo?.os || null,
      },
    });

    const payload: UserPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return { user: userProfile, accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    let decoded: { userId: string };
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN');
    }

    const savedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!savedToken || savedToken.isRevoked || savedToken.expiresAt < new Date()) {
      throw new AppError('Refresh token expired or revoked.', 401, 'REVOKED_REFRESH_TOKEN');
    }

    // Revoke old refresh token (token rotation)
    await prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: { isRevoked: true },
    });

    const user = savedToken.user;
    if (!user.isActive) {
      throw new AppError('Account is disabled.', 403, 'ACCOUNT_DISABLED');
    }

    const payload: UserPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(token?: string) {
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { isRevoked: true },
      });
    }
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Return true to avoid user enumeration
      return { token: null };
    }

    const token = generateRandomToken();
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    return { token, email: user.email, name: user.name };
  }

  async resetPassword(token: string, newPass: string) {
    const reset = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!reset || reset.expiresAt < new Date()) {
      throw new AppError('Password reset link has expired or is invalid.', 400, 'INVALID_RESET_TOKEN');
    }

    const passwordHash = await argon2.hash(newPass);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({ where: { id: reset.id } }),
      prisma.refreshToken.updateMany({
        where: { userId: reset.userId },
        data: { isRevoked: true },
      }),
    ]);

    return true;
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404, 'USER_NOT_FOUND');

    const isValid = await argon2.verify(user.passwordHash, currentPass);
    if (!isValid) throw new AppError('Incorrect current password.', 400, 'INCORRECT_PASSWORD');

    const passwordHash = await argon2.hash(newPass);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return true;
  }
}

export const authService = new AuthService();
