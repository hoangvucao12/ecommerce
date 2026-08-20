import { Injectable } from "@nestjs/common";

import { TokenService } from "src/shared/services/token.service";

import { AuthRepository } from "../repositories/auth.repository";

type SessionUser = {
  id: number;
  roleId: number;
  role: { name: string };
};

type SessionClient = { userAgent: string; ip: string };

@Injectable()
export class SessionService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  async issue(
    user: SessionUser,
    client: SessionClient,
    verificationCodeId?: number,
  ) {
    const device = await this.authRepository.createDevice({
      userId: user.id,
      ...client,
    });

    try {
      const tokens = await this.tokenService.createTokenPair({
        userId: user.id,
        deviceId: device.id,
        roleName: user.role.name,
        roleId: user.roleId,
      });
      await this.authRepository.persistSession(
        {
          token: tokens.refreshToken,
          userId: user.id,
          deviceId: device.id,
          expiresAt: tokens.refreshTokenExpiresAt,
        },
        verificationCodeId,
      );
      return tokens;
    } catch (error) {
      try {
        await this.authRepository.deactivateDevice(device.id);
      } catch {
        // Preserve the session creation error; orphan cleanup can be retried.
      }
      throw error;
    }
  }

  async rotate(
    currentToken: string,
    user: SessionUser,
    deviceId: number,
    client: SessionClient,
  ) {
    const tokens = await this.tokenService.createTokenPair({
      userId: user.id,
      deviceId,
      roleName: user.role.name,
      roleId: user.roleId,
    });
    await this.authRepository.rotateSession(
      currentToken,
      {
        token: tokens.refreshToken,
        userId: user.id,
        deviceId,
        expiresAt: tokens.refreshTokenExpiresAt,
      },
      client,
    );
    return tokens;
  }
}
