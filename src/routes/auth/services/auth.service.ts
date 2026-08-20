import { Injectable } from "@nestjs/common";
import { addMilliseconds } from "date-fns";
import type { CookieOptions, Request, Response } from "express";
import ms from "ms";

import envConfig from "src/shared/config";
import {
  TypeOfVerificationCode,
  TypeOfVerificationCodeType,
  UserStatus,
} from "src/shared/constants/auth.constant";
import { generateOtp, isUniqueConstraintPrismaError } from "src/shared/helpers";
import { SharedRoleRepository } from "src/shared/repositories/shared-role.repo";
import { EmailService } from "src/shared/services/email.service";
import { HashingService } from "src/shared/services/hashing.service";
import { TokenService } from "src/shared/services/token.service";
import { TwoFactorAuthService } from "src/shared/services/2FA.service";

import {
  AccountUnavailableException,
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidCredentialsException,
  InvalidOTPException,
  InvalidRefreshTokenException,
  InvalidTOTPAndCodeException,
  InvalidTOTPException,
  OTPExpiredException,
  TOTPAlreadyEnabledException,
  TOTPNotEnabledException,
} from "../auth.error";
import {
  Disable2FABodyType,
  ForgotPasswordBodyType,
  LoginBodyType,
  RegisterBodyType,
  SendOtpBodyType,
} from "../models/auth.model";
import { AuthRepository } from "../repositories/auth.repository";
import { GoogleAuthService } from "./google-auth.service";
import { SessionService } from "./session.service";

const REFRESH_TOKEN_COOKIE = "refreshToken";
const REFRESH_TOKEN_COOKIE_PATH = "/auth";
const OTP_SENT_MESSAGE =
  "Nếu địa chỉ email hợp lệ, mã OTP đã được gửi. Vui lòng kiểm tra hộp thư.";

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesRepository: SharedRoleRepository,
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly sessionService: SessionService,
  ) {}

  private async validateVerificationCode(
    email: string,
    code: string,
    type: TypeOfVerificationCodeType,
  ) {
    const verificationCode = await this.authRepository.findVerificationCode(
      email,
      type,
    );
    if (!verificationCode) {
      throw InvalidOTPException;
    }
    const codeIsValid = await this.hashingService.compare(
      code,
      verificationCode.code,
    );
    if (!codeIsValid) {
      throw InvalidOTPException;
    }
    if (verificationCode.expiresAt <= new Date()) {
      await this.authRepository.deleteVerificationCode(verificationCode.id);
      throw OTPExpiredException;
    }
    return verificationCode;
  }

  private assertActiveUser(user: {
    status: string;
    role: { deletedAt: Date | null; isActive: boolean };
  }) {
    if (
      user.status !== UserStatus.Active ||
      user.role.deletedAt ||
      !user.role.isActive
    ) {
      throw AccountUnavailableException;
    }
  }

  private readRefreshToken(request: Request) {
    const token: unknown = request.cookies?.[REFRESH_TOKEN_COOKIE];
    if (typeof token !== "string" || token.length === 0) {
      throw InvalidRefreshTokenException;
    }
    return token;
  }

  private setRefreshTokenCookie(response: Response, token: string) {
    response.cookie(REFRESH_TOKEN_COOKIE, token, {
      ...this.cookieOptions(),
      maxAge: ms(envConfig.COOKIE_REFRESH_TOKEN_MAX_AGE as ms.StringValue),
    });
  }

  private clearRefreshTokenCookie(response: Response) {
    response.clearCookie(REFRESH_TOKEN_COOKIE, this.cookieOptions());
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      sameSite: "lax",
      path: REFRESH_TOKEN_COOKIE_PATH,
      ...(envConfig.COOKIE_DOMAIN ? { domain: envConfig.COOKIE_DOMAIN } : {}),
    };
  }

  async register(body: RegisterBodyType) {
    const verificationCode = await this.validateVerificationCode(
      body.email,
      body.code,
      TypeOfVerificationCode.Register,
    );

    try {
      const [roleId, password] = await Promise.all([
        this.rolesRepository.getClientRoleId(),
        this.hashingService.hash(body.password),
      ]);
      return await this.authRepository.registerVerifiedUser(
        verificationCode.id,
        {
          email: body.email,
          name: body.name,
          phoneNumber: body.phoneNumber,
          password,
          roleId,
          status: UserStatus.Active,
        },
      );
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException;
      }
      throw error;
    }
  }

  async sendOtp(body: SendOtpBodyType) {
    const user = await this.authRepository.findUserWithRole({
      email: body.email,
    });
    if (body.type === TypeOfVerificationCode.Register && user) {
      throw EmailAlreadyExistsException;
    }
    if (body.type !== TypeOfVerificationCode.Register && !user) {
      return { message: OTP_SENT_MESSAGE };
    }

    const code = generateOtp();
    const hashedCode = await this.hashingService.hash(code);
    const verificationCode = await this.authRepository.replaceVerificationCode({
      email: body.email,
      code: hashedCode,
      type: body.type,
      expiresAt: addMilliseconds(
        new Date(),
        ms(envConfig.OTP_EXPIRES_IN as ms.StringValue),
      ),
    });

    try {
      const emailResponse = await this.emailService.sendOtp({
        email: body.email,
        code,
        expiresIn: envConfig.OTP_EXPIRES_IN,
      });
      if (emailResponse.error) {
        throw FailedToSendOTPException;
      }
    } catch (error) {
      await this.authRepository.deleteVerificationCode(verificationCode.id);
      if (error === FailedToSendOTPException) {
        throw error;
      }
      throw FailedToSendOTPException;
    }

    return { message: OTP_SENT_MESSAGE };
  }

  async login(
    body: LoginBodyType,
    client: { userAgent: string; ip: string },
    response: Response,
  ) {
    const user = await this.authRepository.findUserWithRole({
      email: body.email,
    });
    if (!user) {
      throw InvalidCredentialsException;
    }

    const passwordIsValid = await this.hashingService.compare(
      body.password,
      user.password,
    );
    if (!passwordIsValid) {
      throw InvalidCredentialsException;
    }
    this.assertActiveUser(user);

    let verificationCodeId: number | undefined;
    if (user.totpSecret) {
      if (!body.totpCode && !body.code) {
        throw InvalidTOTPAndCodeException;
      }
      if (body.totpCode) {
        const valid = this.twoFactorAuthService.verifyTOTPCode({
          email: user.email,
          token: body.totpCode,
          secret: user.totpSecret,
        });
        if (!valid) {
          throw InvalidTOTPException;
        }
      } else if (body.code) {
        const verificationCode = await this.validateVerificationCode(
          user.email,
          body.code,
          TypeOfVerificationCode.Login,
        );
        verificationCodeId = verificationCode.id;
      }
    }

    const tokens = await this.sessionService.issue(
      user,
      client,
      verificationCodeId,
    );
    this.setRefreshTokenCookie(response, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  async refreshToken(
    request: Request,
    client: { userAgent: string; ip: string },
    response: Response,
  ) {
    try {
      const currentToken = this.readRefreshToken(request);
      const [payload, session] = await Promise.all([
        this.tokenService.verifyRefreshToken(currentToken),
        this.authRepository.findRefreshTokenWithSession(currentToken),
      ]);

      if (
        !session ||
        session.expiresAt <= new Date() ||
        !session.device.isActive ||
        payload.userId !== session.userId ||
        payload.deviceId !== session.deviceId
      ) {
        throw InvalidRefreshTokenException;
      }
      this.assertActiveUser(session.user);

      const tokens = await this.sessionService.rotate(
        currentToken,
        session.user,
        session.deviceId,
        client,
      );
      this.setRefreshTokenCookie(response, tokens.refreshToken);
      return { accessToken: tokens.accessToken };
    } catch (error) {
      this.clearRefreshTokenCookie(response);
      if (
        error === InvalidRefreshTokenException ||
        error === AccountUnavailableException
      ) {
        throw error;
      }
      throw InvalidRefreshTokenException;
    }
  }

  async logout(request: Request, response: Response) {
    try {
      const refreshToken = this.readRefreshToken(request);
      await this.tokenService.verifyRefreshToken(refreshToken);
      await this.authRepository.revokeSession(refreshToken);
      return { message: "Đăng xuất thành công" };
    } catch {
      throw InvalidRefreshTokenException;
    } finally {
      this.clearRefreshTokenCookie(response);
    }
  }

  async googleCallback(code: string, state: string, response: Response) {
    try {
      const tokens = await this.googleAuthService.handleCallback(code, state);
      this.setRefreshTokenCookie(response, tokens.refreshToken);
      return response.redirect(
        `${envConfig.GOOGLE_FRONTEND_REDIRECT_URI}#accessToken=${encodeURIComponent(tokens.accessToken)}&success=true`,
      );
    } catch {
      return response.redirect(
        `${envConfig.GOOGLE_FRONTEND_REDIRECT_URI}?error=google_auth_failed`,
      );
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const user = await this.authRepository.findUserWithRole({
      email: body.email,
    });
    if (!user) {
      throw EmailNotFoundException;
    }
    const verificationCode = await this.validateVerificationCode(
      body.email,
      body.code,
      TypeOfVerificationCode.ForgotPassword,
    );
    const password = await this.hashingService.hash(body.newPassword);
    await this.authRepository.resetPassword(
      verificationCode.id,
      user.id,
      password,
    );
    return { message: "Mật khẩu đã được đặt lại thành công" };
  }

  async setup2FA(userId: number) {
    const user = await this.authRepository.findUserWithRole({ id: userId });
    if (!user) {
      throw EmailNotFoundException;
    }
    if (user.totpSecret) {
      throw TOTPAlreadyEnabledException;
    }
    const result = this.twoFactorAuthService.generateTOTPSecret(user.email);
    await this.authRepository.updateTotpSecret(userId, result.secret);
    return result;
  }

  async disable2FA(body: Disable2FABodyType, userId: number) {
    const user = await this.authRepository.findUserWithRole({ id: userId });
    if (!user) {
      throw EmailNotFoundException;
    }
    if (!user.totpSecret) {
      throw TOTPNotEnabledException;
    }

    let verificationCodeId: number | undefined;
    if (body.totpCode) {
      const valid = this.twoFactorAuthService.verifyTOTPCode({
        email: user.email,
        token: body.totpCode,
        secret: user.totpSecret,
      });
      if (!valid) {
        throw InvalidTOTPException;
      }
    } else if (body.code) {
      const verificationCode = await this.validateVerificationCode(
        user.email,
        body.code,
        TypeOfVerificationCode.Disable2FA,
      );
      verificationCodeId = verificationCode.id;
    }

    await this.authRepository.updateTotpSecret(
      userId,
      null,
      verificationCodeId,
    );
    return { message: "2FA đã được tắt thành công" };
  }
}
