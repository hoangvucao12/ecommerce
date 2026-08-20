import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import envConfig from "src/shared/config";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: { "x-api-key"?: string | string[] };
    }>();
    const apiKey = request.headers["x-api-key"];
    if (typeof apiKey !== "string" || apiKey !== envConfig.SECRET_API_KEY) {
      throw new UnauthorizedException("Invalid API key");
    }
    return true;
  }
}
