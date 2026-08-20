import { Injectable } from "@nestjs/common";
import { JwtService, type JwtSignOptions } from "@nestjs/jwt";
import envConfig from "src/shared/config";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  AccessTokenPayloadCreate,
  OAuthStatePayload,
} from "../types/jwt.type";
import { randomUUID } from "crypto";

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async createTokenPair(payload: AccessTokenPayloadCreate) {
    const accessToken = this.jwtService.sign(payload, {
      secret: envConfig.JWT_SECRET,
      expiresIn: envConfig.JWT_EXPIRES_IN as JwtSignOptions["expiresIn"],
      jwtid: randomUUID(),
    });
    const refreshToken = this.jwtService.sign(
      { userId: payload.userId, deviceId: payload.deviceId },
      {
        secret: envConfig.JWT_REFRESH_SECRET,
        expiresIn:
          envConfig.JWT_REFRESH_EXPIRES_IN as JwtSignOptions["expiresIn"],
        jwtid: randomUUID(),
      },
    );
    const decoded = await this.verifyRefreshToken(refreshToken);

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: new Date(decoded.exp * 1000),
    };
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.JWT_SECRET,
    });
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.JWT_REFRESH_SECRET,
    });
  }

  signOAuthState(payload: { userAgent: string; ip: string }) {
    return this.jwtService.sign(payload, {
      secret: envConfig.JWT_SECRET,
      expiresIn: "10m",
      audience: "google-oauth-state",
      issuer: "sodaka",
      jwtid: randomUUID(),
    });
  }

  verifyOAuthState(state: string): Promise<OAuthStatePayload> {
    return this.jwtService.verifyAsync(state, {
      secret: envConfig.JWT_SECRET,
      audience: "google-oauth-state",
      issuer: "sodaka",
    });
  }
}
