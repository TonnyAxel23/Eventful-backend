import { hashPassword, comparePassword } from '../../../utils/hashPassword';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../utils/jwt';
import userRepository from '../repositories/user.repository';
import { RegisterDto, LoginDto, AuthResponse, TokenPayload } from '../types/auth.types';
import { AppError } from '../../../middleware/error.middleware';
import logger from '../../../utils/logger';
import { sendEmail } from '../../../utils/email';

class AuthService {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    const hashedPassword = await hashPassword(data.password);
    
    const user = await userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await userRepository.updateRefreshToken(user.id, refreshToken);

    // Send welcome email (async, don't await)
    sendEmail({
      to: user.email,
      subject: 'Welcome to Eventful!',
      template: 'welcome',
      data: { name: user.firstName },
    }).catch(error => logger.error('Failed to send welcome email:', error));

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    const isValidPassword = await comparePassword(data.password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await userRepository.updateRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(newPayload);

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return;
    }

    const resetToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await userRepository.setPasswordResetToken(user.id, resetToken, resetExpires);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'passwordReset',
      data: { name: user.firstName, resetUrl },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const hashedPassword = await hashPassword(newPassword);
    await userRepository.updatePassword(user.id, hashedPassword);
    await userRepository.clearResetToken(user.id);
  }
}

export default new AuthService();
