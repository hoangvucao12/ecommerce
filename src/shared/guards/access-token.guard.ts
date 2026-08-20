import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { HTTPMethod } from "@prisma/client";

import {
  REQUEST_ROLE_PERMISSIONS,
  REQUEST_USER_KEY,
  UserStatus,
} from "../constants/auth.constant";
import { PrismaService } from "../services/prisma.service";
import { TokenService } from "../services/token.service";
import { AccessTokenPayload } from "../types/jwt.type";

type AuthenticatedRequest = {
  headers: { authorization?: string };
  method: string;
  route?: { path?: string };
  [REQUEST_USER_KEY]?: AccessTokenPayload;
  [REQUEST_ROLE_PERMISSIONS]?: unknown;
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const decoded = await this.extractAndValidateAccessToken(request);
    await this.validateUserPermissions(decoded, request);
    return true;
  }

  private async extractAndValidateAccessToken(
    request: AuthenticatedRequest,
  ): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request);
    try {
      return await this.tokenService.verifyAccessToken(accessToken);
    } catch {
      throw new UnauthorizedException("Access token không hợp lệ");
    }
  }

  private extractAccessTokenFromHeader(request: AuthenticatedRequest): string {
    const [scheme, accessToken, extra] =
      request.headers.authorization?.split(" ") ?? [];
    if (scheme?.toLowerCase() !== "bearer" || !accessToken || extra) {
      throw new UnauthorizedException("Thiếu Bearer access token");
    }
    return accessToken;
  }

  private async validateUserPermissions(
    decoded: AccessTokenPayload,
    request: AuthenticatedRequest,
  ): Promise<void> {
    const path = request.route?.path;
    if (!path) {
      throw new ForbiddenException("Không xác định được tài nguyên truy cập");
    }

    const user = await this.prismaService.user.findFirst({
      where: {
        id: decoded.userId,
        deletedAt: null,
        status: UserStatus.Active,
        devices: { some: { id: decoded.deviceId, isActive: true } },
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null,
                path,
                method: request.method as HTTPMethod,
              },
            },
          },
        },
      },
    });

    if (!user || user.role.deletedAt || !user.role.isActive) {
      throw new ForbiddenException(
        "Tài khoản hoặc vai trò không còn hoạt động",
      );
    }
    if (user.role.permissions.length === 0) {
      throw new ForbiddenException(
        "Bạn không có quyền truy cập vào tài nguyên này",
      );
    }

    request[REQUEST_USER_KEY] = {
      ...decoded,
      roleId: user.roleId,
      roleName: user.role.name,
    };
    request[REQUEST_ROLE_PERMISSIONS] = user.role;
  }
}
