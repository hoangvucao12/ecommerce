import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import {
  RegisterBodyType,
  VerificationCodeType,
  DeviceType,
  RoleType,
  RefreshTokenType,
} from "./auth.model";
import { UserType } from "src/shared/models/shared-user.model";
import { TypeOfVerificationCodeType } from "src/shared/constants/auth.constant";

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async createUser(
    user: Omit<RegisterBodyType, "confirmPassword" | "code"> &
      Pick<UserType, "roleId">,
  ): Promise<Omit<UserType, "password" | "totpSecret">> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
  }

  async createVerificationCode(
    payload: Pick<
      VerificationCodeType,
      "email" | "type" | "code" | "expiresAt"
    >,
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.upsert({
      where: {
        email: payload.email,
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    });
  }

  async findUniqueVerificationCode(
    uniqueValue:
      | {
          email: string;
          code: string;
          type: TypeOfVerificationCodeType;
        }
      | { email: string }
      | { id: number },
  ): Promise<VerificationCodeType | null> {
    return await this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    });
  }

  async createRefreshToken(data: {
    token: string;
    userId: number;
    expiresAt: Date;
    deviceId: number;
  }) {
    return await this.prismaService.refreshToken.create({
      data,
    });
  }

  async createDevice(
    data: Pick<DeviceType, "userId" | "userAgent" | "ip"> &
      Partial<Pick<DeviceType, "lastActive" | "isActive">>,
  ) {
    return await this.prismaService.device.create({
      data,
    });
  }

  async findUniqueUserIncludeRole(
    uniqueValue: { id: number } | { email: string },
  ): Promise<(UserType & { role: RoleType }) | null> {
    return await this.prismaService.user.findUnique({
      where: uniqueValue,
      include: {
        role: true,
      },
    });
  }

  async findUniqueRefreshTokenIncludeUserRole(uniqueValue: {
    token: string;
  }): Promise<
    (RefreshTokenType & { user: UserType & { role: RoleType } }) | null
  > {
    return await this.prismaService.refreshToken.findUnique({
      where: uniqueValue,
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async updateDevice(
    deviceId: number,
    data: Partial<DeviceType>,
  ): Promise<DeviceType | null> {
    return await this.prismaService.device.update({
      where: { id: deviceId },
      data,
    });
  }

  async deleteRefreshToken(token: string): Promise<RefreshTokenType | null> {
    return await this.prismaService.refreshToken.delete({
      where: { token },
    });
  }
}
