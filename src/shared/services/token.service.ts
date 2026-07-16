import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import envConfig from "src/shared/config";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  RefreshTokenPayloadCreate,
  AccessTokenPayloadCreate,
} from "../types/jwt.type";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: AccessTokenPayloadCreate) {
    return this.jwtService.sign({ ...payload, uuid: uuidv4() }, {
      secret: envConfig.JWT_SECRET,
      expiresIn: envConfig.JWT_EXPIRES_IN,
    } as any);
  }

  signRefreshToken(payload: RefreshTokenPayloadCreate) {
    return this.jwtService.sign({ ...payload, uuid: uuidv4() }, {
      secret: envConfig.JWT_REFRESH_SECRET,
      expiresIn: envConfig.JWT_REFRESH_EXPIRES_IN,
    } as any);
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
}
