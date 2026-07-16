import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UnprocessableEntityException } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { HashingService } from "src/shared/services/hashing.service";
import { AuthRepository } from "./auth.repo";
import {
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOtpBodyType,
} from "./auth.model";
import { SharedUserRepository } from "src/shared/repositories/shared-user.repo";
import {
  isUniqueConstraintPrismaError,
  generateOtp,
  isNotFoundPrismaError,
} from "src/shared/helpers";
import { addMilliseconds } from "date-fns";
import { TypeOfVerificationCode } from "src/shared/constants/auth.constant";
import envConfig from "src/shared/config";
import ms from "ms";
import { EmailService } from "src/shared/services/email.service";
import { TokenService } from "src/shared/services/token.service";
import { AccessTokenPayloadCreate } from "src/shared/types/jwt.type";

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId();
      const hashedPassword = await this.hashingService.hash(body.password);
      const verificationCode =
        await this.authRepository.findUniqueVerificationCode({
          email: body.email,
          code: body.code,
          type: TypeOfVerificationCode.Register,
        });

      if (!verificationCode) {
        throw new UnprocessableEntityException([
          {
            field: "code",
            message: "Mã OTP không hợp lệ",
          },
        ]);
      }

      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            field: "code",
            message: "Mã OTP đã hết hạn",
          },
        ]);
      }

      return await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new UnprocessableEntityException([
          {
            field: "email",
            message: "Email đã tồn tại",
          },
        ]);
      }
      throw error;
    }
  }

  async sendOtp(body: SendOtpBodyType) {
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    });
    if (user) {
      throw new UnprocessableEntityException([
        {
          field: "email",
          message: "Email đã tồn tại",
        },
      ]);
    }

    const code = generateOtp();
    await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(
        new Date(),
        ms(
          envConfig.OTP_EXPIRES_IN as `${number}${"ms" | "s" | "m" | "h" | "d"}`,
        ),
      ),
    });
    const emailResponse = await this.emailService.sendOtp({
      email: body.email,
      code,
    });
    if (emailResponse.error) {
      throw new UnprocessableEntityException([
        {
          field: "code",
          message: "Gửi mã OTP thất bại, vui lòng thử lại",
        },
      ]);
    }
    return {
      message: "Gửi mã OTP thành công, vui lòng kiểm tra email của bạn",
    };
  }

  async login(body: LoginBodyType, userAgent: string, ip: string) {
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    });

    if (!user) {
      throw new UnprocessableEntityException([
        {
          field: "email",
          message: "Email không tồn tại",
        },
      ]);
    }

    const isPasswordValid = await this.hashingService.compare(
      body.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnprocessableEntityException([
        {
          field: "password",
          message: "Mật khẩu không đúng",
        },
      ]);
    }

    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent,
      ip,
    });

    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleName: user.role.name,
      roleId: user.roleId,
    });

    return tokens;
  }

  async generateTokens(payload: AccessTokenPayloadCreate) {
    const accessToken: string = this.tokenService.signAccessToken(payload);
    const refreshToken: string = this.tokenService.signRefreshToken({
      userId: payload.userId,
    });

    const decodedRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: payload.userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId: payload.deviceId,
    });
    return { accessToken, refreshToken };
  }

  async refreshToken({
    refreshToken,
    userAgent,
    ip,
  }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      const { userId } =
        await this.tokenService.verifyRefreshToken(refreshToken);

      const refreshTokenInDb =
        await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
          token: refreshToken,
        });

      if (!refreshTokenInDb) {
        throw new UnauthorizedException([
          {
            field: "token",
            message: "Refresh token không hợp lệ",
          },
        ]);
      }

      const $updatedDevice = this.authRepository.updateDevice(
        refreshTokenInDb.deviceId,
        {
          userAgent,
          ip,
        },
      );

      const $deleteRefreshToken = this.authRepository.deleteRefreshToken(
        refreshTokenInDb.token,
      );

      const $tokens = this.generateTokens({
        userId: userId,
        deviceId: refreshTokenInDb.deviceId,
        roleName: refreshTokenInDb.user.role.name,
        roleId: refreshTokenInDb.user.roleId,
      });

      const [, , tokens] = await Promise.all([
        $updatedDevice,
        $deleteRefreshToken,
        $tokens,
      ]);

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.tokenService.verifyRefreshToken(refreshToken);

      const deleteRefreshToken =
        await this.authRepository.deleteRefreshToken(refreshToken);

      if (!deleteRefreshToken) {
        throw new UnauthorizedException("refresh token không hợp lệ");
      }

      await this.authRepository.updateDevice(deleteRefreshToken.deviceId, {
        isActive: false,
      });

      return { message: "Đăng xuất thành công" };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException("refresh token không hợp lệ");
      }
      throw new UnauthorizedException();
    }
  }
}
