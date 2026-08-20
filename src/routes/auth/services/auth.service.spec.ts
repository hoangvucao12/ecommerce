import type { Request, Response } from "express";

import {
  TypeOfVerificationCode,
  UserStatus,
} from "src/shared/constants/auth.constant";
import { SharedRoleRepository } from "src/shared/repositories/shared-role.repo";
import { EmailService } from "src/shared/services/email.service";
import { TokenService } from "src/shared/services/token.service";
import { TwoFactorAuthService } from "src/shared/services/2FA.service";

import { InvalidRefreshTokenException } from "../auth.error";
import { AuthRepository } from "../repositories/auth.repository";
import { AuthService } from "./auth.service";
import { GoogleAuthService } from "./google-auth.service";
import { SessionService } from "./session.service";

const activeUser = {
  id: 1,
  email: "user@sodaka.test",
  password: "hashed-password",
  name: "User",
  phoneNumber: "0123456789",
  avatar: null,
  totpSecret: "totp-secret",
  status: UserStatus.Active,
  roleId: 2,
  role: {
    id: 2,
    name: "USER",
    isActive: true,
    deletedAt: null,
  },
};

describe("AuthService", () => {
  const rolesRepository = { getClientRoleId: jest.fn() };
  const hashingService = { hash: jest.fn(), compare: jest.fn() };
  const authRepository = {
    findUserWithRole: jest.fn(),
    findVerificationCode: jest.fn(),
    deleteVerificationCode: jest.fn(),
    updateTotpSecret: jest.fn(),
    findRefreshTokenWithSession: jest.fn(),
  };
  const emailService = { sendOtp: jest.fn() };
  const tokenService = { verifyRefreshToken: jest.fn() };
  const googleAuthService = { handleCallback: jest.fn() };
  const twoFactorAuthService = {
    verifyTOTPCode: jest.fn(),
    generateTOTPSecret: jest.fn(),
  };
  const sessionService = { issue: jest.fn(), rotate: jest.fn() };

  const service = new AuthService(
    rolesRepository as unknown as SharedRoleRepository,
    hashingService,
    authRepository as unknown as AuthRepository,
    emailService as unknown as EmailService,
    tokenService as unknown as TokenService,
    googleAuthService as unknown as GoogleAuthService,
    twoFactorAuthService as unknown as TwoFactorAuthService,
    sessionService as unknown as SessionService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("verifies and consumes the email code before disabling 2FA", async () => {
    authRepository.findUserWithRole.mockResolvedValue(activeUser);
    hashingService.compare.mockResolvedValue(true);
    authRepository.findVerificationCode.mockResolvedValue({
      id: 77,
      email: activeUser.email,
      code: "123456",
      type: TypeOfVerificationCode.Disable2FA,
      expiresAt: new Date(Date.now() + 60_000),
    });
    authRepository.updateTotpSecret.mockResolvedValue({
      ...activeUser,
      totpSecret: null,
    });

    await service.disable2FA({ code: "123456" }, activeUser.id);

    expect(authRepository.findVerificationCode).toHaveBeenCalledWith(
      activeUser.email,
      TypeOfVerificationCode.Disable2FA,
    );
    expect(authRepository.updateTotpSecret).toHaveBeenCalledWith(
      activeUser.id,
      null,
      77,
    );
  });

  it("consumes a login OTP in the same session persistence flow", async () => {
    authRepository.findUserWithRole.mockResolvedValue(activeUser);
    hashingService.compare.mockResolvedValue(true);
    authRepository.findVerificationCode.mockResolvedValue({
      id: 88,
      email: activeUser.email,
      code: "654321",
      type: TypeOfVerificationCode.Login,
      expiresAt: new Date(Date.now() + 60_000),
    });
    sessionService.issue.mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
    const cookie = jest.fn();
    const response = { cookie } as unknown as Response;

    await service.login(
      {
        email: activeUser.email,
        password: "password123",
        code: "654321",
      },
      { userAgent: "jest", ip: "127.0.0.1" },
      response,
    );

    expect(sessionService.issue).toHaveBeenCalledWith(
      activeUser,
      { userAgent: "jest", ip: "127.0.0.1" },
      88,
    );
    expect(cookie).toHaveBeenCalled();
  });

  it("rejects a refresh token whose JWT device does not match its DB session", async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({
      userId: activeUser.id,
      deviceId: 999,
    });
    authRepository.findRefreshTokenWithSession.mockResolvedValue({
      token: "refresh-token",
      userId: activeUser.id,
      deviceId: 10,
      expiresAt: new Date(Date.now() + 60_000),
      device: { id: 10, isActive: true },
      user: activeUser,
    });
    const request = {
      cookies: { refreshToken: "refresh-token" },
    } as unknown as Request;
    const clearCookie = jest.fn();
    const response = { clearCookie } as unknown as Response;

    await expect(
      service.refreshToken(
        request,
        { userAgent: "jest", ip: "127.0.0.1" },
        response,
      ),
    ).rejects.toBe(InvalidRefreshTokenException);
    expect(sessionService.rotate).not.toHaveBeenCalled();
    expect(clearCookie).toHaveBeenCalled();
  });
});
