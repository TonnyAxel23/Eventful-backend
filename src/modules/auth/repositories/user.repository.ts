import prisma from '../../../config/database';
import { CreateUserDto, UpdateUserDto } from '../types/auth.types';

class UserRepository {
  async create(data: CreateUserDto) {
    return await prisma.user.create({
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async updateRefreshToken(id: string, refreshToken: string | null) {
    return await prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async updatePassword(id: string, password: string) {
    return await prisma.user.update({
      where: { id },
      data: { password },
    });
  }

  async setPasswordResetToken(id: string, token: string, expires: Date) {
    return await prisma.user.update({
      where: { id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });
  }

  async findByResetToken(token: string) {
    return await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });
  }

  async clearResetToken(id: string) {
    return await prisma.user.update({
      where: { id },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }
}

export default new UserRepository();
