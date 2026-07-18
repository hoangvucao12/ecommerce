import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import envConfig from "src/shared/config";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const xApiKey = request.headers["x-api-key"];
    if (xApiKey !== envConfig.SECRET_API_KEY) {
      throw new UnauthorizedException("Invalid API key");
    }
    return true;
  }
}
