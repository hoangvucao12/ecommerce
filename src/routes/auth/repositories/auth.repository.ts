import { Injectable } from "@nestjs/common";
import { Prisma, VerificationCodeType } from "@prisma/client";

import { PrismaService } from "src/shared/services/prisma.service";

type UserLookup = { id: number } | { email: string };

type RefreshTokenData = {
  token: string;
  userId: number;
  deviceId: number;
  expiresAt: Date;
};

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserWithRole(where: UserLookup) {
    return this.prisma.user.findFirst({
      where: { ...where, deletedAt: null },
      include: { role: true },
    });
  }

  createUserWithRole(data: Prisma.UserUncheckedCreateInput) {
    return this.prisma.user.create({ data, include: { role: true } });
  }

  findVerificationCode(email: string, type: VerificationCodeType) {
    return this.prisma.verificationCode.findUnique({
      where: { email_type: { email, type } },
    });
  }

  replaceVerificationCode(data: {
    email: string;
    type: VerificationCodeType;
    code: string;
    expiresAt: Date;
  }) {
    return this.prisma.verificationCode.upsert({
      where: { email_type: { email: data.email, type: data.type } },
      create: data,
      update: { code: data.code, expiresAt: data.expiresAt },
    });
  }

  deleteVerificationCode(id: number) {
    return this.prisma.verificationCode.deleteMany({ where: { id } });
  }

  registerVerifiedUser(
    verificationCodeId: number,
    data: Prisma.UserUncheckedCreateInput,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.verificationCode.delete({
        where: { id: verificationCodeId },
      });
      return transaction.user.create({
        data,
        omit: { password: true, totpSecret: true },
      });
    });
  }

  resetPassword(verificationCodeId: number, userId: number, password: string) {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.verificationCode.delete({
        where: { id: verificationCodeId },
      });
      await transaction.user.update({
        where: { id: userId, deletedAt: null },
        data: { password },
      });
      await transaction.refreshToken.deleteMany({ where: { userId } });
      await transaction.device.updateMany({
        where: { userId },
        data: { isActive: false },
      });
    });
  }

  createDevice(data: { userId: number; userAgent: string; ip: string }) {
    return this.prisma.device.create({ data });
  }

  deactivateDevice(deviceId: number) {
    return this.prisma.device.updateMany({
      where: { id: deviceId },
      data: { isActive: false },
    });
  }

  persistSession(data: RefreshTokenData, verificationCodeId?: number) {
    return this.prisma.$transaction(async (transaction) => {
      if (verificationCodeId !== undefined) {
        await transaction.verificationCode.delete({
          where: { id: verificationCodeId },
        });
      }
      return transaction.refreshToken.create({ data });
    });
  }

  findRefreshTokenWithSession(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { device: true, user: { include: { role: true } } },
    });
  }

  rotateSession(
    currentToken: string,
    nextToken: RefreshTokenData,
    client: { userAgent: string; ip: string },
  ) {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.refreshToken.delete({
        where: { token: currentToken },
      });
      await transaction.device.update({
        where: { id: nextToken.deviceId },
        data: { ...client, isActive: true },
      });
      return transaction.refreshToken.create({ data: nextToken });
    });
  }

  revokeSession(token: string) {
    return this.prisma.$transaction(async (transaction) => {
      const deleted = await transaction.refreshToken.delete({
        where: { token },
      });
      await transaction.device.update({
        where: { id: deleted.deviceId },
        data: { isActive: false },
      });
      return deleted;
    });
  }

  updateTotpSecret(
    userId: number,
    totpSecret: string | null,
    verificationCodeId?: number,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      if (verificationCodeId !== undefined) {
        await transaction.verificationCode.delete({
          where: { id: verificationCodeId },
        });
      }
      return transaction.user.update({
        where: { id: userId, deletedAt: null },
        data: { totpSecret },
      });
    });
  }
}
