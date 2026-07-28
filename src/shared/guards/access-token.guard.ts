import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { TokenService } from "../services/token.service";
import {
  REQUEST_ROLE_PERMISSIONS,
  REQUEST_USER_KEY,
} from "../constants/auth.constant";
import { AccessTokenPayload } from "../types/jwt.type";
import { PrismaService } from "../services/prisma.service";

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const decoded = await this.extractAndValidateAccessToken(request);
    await this.validateUserPermissions(decoded, request);
    return true;
  }

  private async extractAndValidateAccessToken(
    request: any,
  ): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request);
    try {
      const decoded = await this.tokenService.verifyAccessToken(accessToken);
      request[REQUEST_USER_KEY] = decoded;
      return decoded;
    } catch {
      throw new UnauthorizedException("Access token không hợp lệ");
    }
  }

  private extractAccessTokenFromHeader(request: any): string {
    const accessToken = request.headers["authorization"]?.split(" ")[1];
    if (!accessToken) {
      throw new UnauthorizedException("Access token is missing");
    }
    return accessToken;
  }

  private async validateUserPermissions(
    decoded: AccessTokenPayload,
    request: any,
  ): Promise<void> {
    const roleId = decoded.roleId;
    const path = request.route.path;
    const method = request.method;
    const role = await this.prismaService.role
      .findUniqueOrThrow({
        where: { id: roleId, deletedAt: null },
        include: { permissions: { where: { deletedAt: null, path, method } } },
      })
      .catch(() => {
        throw new ForbiddenException("Role không tồn tại");
      });
    const canAccess = role.permissions.length > 0;
    if (!canAccess) {
      throw new ForbiddenException(
        "Bạn không có quyền truy cập vào tài nguyên này",
      );
    }
    request[REQUEST_ROLE_PERMISSIONS] = role;
  }
}
