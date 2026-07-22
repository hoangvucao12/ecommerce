import { Injectable, UnauthorizedException } from "@nestjs/common";
import { GoogleService } from "./google.service";
import { RolesService } from "./roles.service";
import { HashingService } from "src/shared/services/hashing.service";
import { TwoFactorAuthService } from "src/shared/services/2FA.service";
import { AuthRepository } from "./auth.repo";
import {
  LoginBodyType,
  RegisterBodyType,
  SendOtpBodyType,
  ForgotPasswordBodyType,
  Disable2FABodyType,
} from "./auth.model";
import { SharedUserRepository } from "src/shared/repositories/shared-user.repo";
import {
  isUniqueConstraintPrismaError,
  generateOtp,
  isNotFoundPrismaError,
} from "src/shared/helpers";
import { addMilliseconds } from "date-fns";
import {
  TypeOfVerificationCode,
  TypeOfVerificationCodeType,
} from "src/shared/constants/auth.constant";
import envConfig from "src/shared/config";
import ms from "ms";
import { EmailService } from "src/shared/services/email.service";
import { TokenService } from "src/shared/services/token.service";
import { AccessTokenPayloadCreate } from "src/shared/types/jwt.type";
import type { Response, Request } from "express";
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  InvalidPasswordException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  TOTPAlreadyEnabledException,
  InvalidTOTPAndCodeException,
  InvalidTOTPException,
  TOTPNotEnabledException,
} from "./error.model";

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly googleService: GoogleService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    const cookieMaxAge = ms(
      envConfig.COOKIE_REFRESH_TOKEN_MAX_AGE as `${number}${"ms" | "s" | "m" | "h" | "d"}`,
    );
    const cookieOptions: Record<string, unknown> = {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: cookieMaxAge,
    };
    if (envConfig.COOKIE_DOMAIN) {
      cookieOptions.domain = envConfig.COOKIE_DOMAIN;
    }
    res.cookie("refreshToken", refreshToken, cookieOptions);
  }

  private clearRefreshTokenCookie(res: Response) {
    const cookieOptions: Record<string, unknown> = {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    };
    if (envConfig.COOKIE_DOMAIN) {
      cookieOptions.domain = envConfig.COOKIE_DOMAIN;
    }
    res.clearCookie("refreshToken", cookieOptions);
  }

  private async validateVerificationCode(
    email: string,
    code: string,
    type: TypeOfVerificationCodeType,
  ) {
    const verificationCode =
      await this.authRepository.findUniqueVerificationCode({
        email_code_type: {
          email,
          code,
          type,
        },
      });
    if (!verificationCode) {
      throw InvalidOTPException;
    }
    if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException;
    }
    return verificationCode;
  }

  async register(body: RegisterBodyType) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId();
      const hashedPassword = await this.hashingService.hash(body.password);

      await this.validateVerificationCode(
        body.email,
        body.code,
        TypeOfVerificationCode.Register,
      );

      const [user] = await Promise.all([
        this.authRepository.createUser({
          email: body.email,
          name: body.name,
          phoneNumber: body.phoneNumber,
          password: hashedPassword,
          roleId: clientRoleId,
        }),
        this.authRepository.deleteVerificationCode({
          email_code_type: {
            email: body.email,
            code: body.code,
            type: TypeOfVerificationCode.Register,
          },
        }),
      ]);

      return user;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException;
      }
      throw error;
    }
  }

  async sendOtp(body: SendOtpBodyType) {
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    });

    if (body.type === TypeOfVerificationCode.Register && user) {
      throw EmailAlreadyExistsException;
    }

    if (body.type === TypeOfVerificationCode.ForgotPassword && !user) {
      throw EmailNotFoundException;
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
      throw FailedToSendOTPException;
    }
    return {
      message: "Gửi mã OTP thành công, vui lòng kiểm tra email của bạn",
    };
  }

  async login(
    body: LoginBodyType,
    userAgent: string,
    ip: string,
    res: Response,
  ) {
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    });

    if (!user) {
      throw EmailNotFoundException;
    }

    const isPasswordValid = await this.hashingService.compare(
      body.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw InvalidPasswordException;
    }

    if (user.totpSecret) {
      if (!body.totpCode && !body.code) {
        throw InvalidTOTPAndCodeException;
      }

      if (body.totpCode) {
        const isTOTPValid = this.twoFactorAuthService.verifyTOTPCode({
          email: user.email,
          token: body.totpCode,
          secret: user.totpSecret,
        });
        if (!isTOTPValid) {
          throw InvalidTOTPException;
        }
      } else if (body.code) {
        await this.validateVerificationCode(
          user.email,
          body.code,
          TypeOfVerificationCode.Login,
        );
      }
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

    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return res.status(200).json({ accessToken: tokens.accessToken });
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

  async refreshToken(
    { req, userAgent, ip }: { req: Request; userAgent: string; ip: string },
    res: Response,
  ) {
    try {
      const { userId } = await this.tokenService.verifyRefreshToken(
        req.cookies["refreshToken"],
      );

      const refreshTokenInDb =
        await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
          token: req.cookies["refreshToken"],
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

      this.setRefreshTokenCookie(res, tokens.refreshToken);
      return res.status(200).json({ accessToken: tokens.accessToken });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies["refreshToken"];
      await this.tokenService.verifyRefreshToken(refreshToken);

      const deleteRefreshToken =
        await this.authRepository.deleteRefreshToken(refreshToken);

      if (!deleteRefreshToken) {
        throw RefreshTokenAlreadyUsedException;
      }

      await this.authRepository.updateDevice(deleteRefreshToken.deviceId, {
        isActive: false,
      });

      this.clearRefreshTokenCookie(res);
      return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenAlreadyUsedException;
      }
      throw new UnauthorizedException();
    }
  }

  async googleCallback(code: string, state: string, res: Response) {
    try {
      const data = await this.googleService.handleGoogleCallback(code, state);

      this.setRefreshTokenCookie(res, data.refreshToken);

      return res.redirect(
        envConfig.GOOGLE_FRONTEND_REDIRECT_URI +
          "?accessToken=" +
          data.accessToken +
          "&success=true",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.redirect(
        envConfig.GOOGLE_FRONTEND_REDIRECT_URI +
          "?error=" +
          encodeURIComponent(message),
      );
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body;
    const user = await this.sharedUserRepository.findUnique({
      email,
    });
    if (!user) {
      throw EmailNotFoundException;
    }

    await this.validateVerificationCode(
      email,
      code,
      TypeOfVerificationCode.ForgotPassword,
    );

    const hashedPassword = await this.hashingService.hash(newPassword);
    await Promise.all([
      this.authRepository.updateUser(
        { id: user.id },
        { password: hashedPassword },
      ),
      this.authRepository.deleteVerificationCode({
        email_code_type: {
          email,
          code,
          type: TypeOfVerificationCode.ForgotPassword,
        },
      }),
    ]);

    return { message: "Mật khẩu đã được đặt lại thành công" };
  }

  async setup2FA(userId: number) {
    const user = await this.sharedUserRepository.findUnique({ id: userId });
    if (!user) {
      throw EmailNotFoundException;
    }
    if (user.totpSecret) {
      throw TOTPAlreadyEnabledException;
    }

    const { secret, uri } = this.twoFactorAuthService.generateTOTPSecret(
      user.email,
    );

    await this.authRepository.updateUser(
      { id: userId },
      { totpSecret: secret },
    );

    return { secret, uri };
  }

  async disable2FA(body: Disable2FABodyType, userId: number) {
    const { code, totpCode } = body;
    const user = await this.sharedUserRepository.findUnique({ id: userId });
    if (!user) {
      throw EmailNotFoundException;
    }
    if (!user.totpSecret) {
      throw TOTPNotEnabledException;
    }

    if (totpCode) {
      const isTOTPValid = this.twoFactorAuthService.verifyTOTPCode({
        email: user.email,
        token: totpCode,
        secret: user.totpSecret,
      });
      if (!isTOTPValid) {
        throw InvalidTOTPException;
      } else if (code) {
        await this.validateVerificationCode(
          user.email,
          code,
          TypeOfVerificationCode.Disable2FA,
        );
      }
    }
    await this.authRepository.updateUser({ id: userId }, { totpSecret: null });

    return { message: "2FA đã được tắt thành công" };
  }
}
