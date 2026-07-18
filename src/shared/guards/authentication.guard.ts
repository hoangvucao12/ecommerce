import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  AUTH_TYPE_DECORATOR_PAYLOAD,
  AUTH_TYPE_KEY,
} from "../decorators/auth.decorator";
import { ApiKeyGuard } from "./api-key.guard";
import { AccessTokenGuard } from "./access-token.guard";
import { AuthType, ConditionGuard } from "../constants/auth.constant";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.ApiKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.reflector.getAllAndOverride<
      AUTH_TYPE_DECORATOR_PAYLOAD | undefined
    >(AUTH_TYPE_KEY, [context.getHandler(), context.getClass()]) ?? {
      AuthTypes: [AuthType.Bearer],
      options: { condition: ConditionGuard.And },
    };

    const guards = authTypeValue.AuthTypes.map((authType) => {
      const guard = this.authTypeGuardMap[authType];
      if (!guard) {
        throw new Error(`No guard found for auth type: ${authType}`);
      }
      return guard;
    });

    let error = new UnauthorizedException();

    if (authTypeValue.options.condition === ConditionGuard.Or) {
      for (const guard of guards) {
        const canActivate = await Promise.resolve(
          guard.canActivate(context),
        ).catch((err) => {
          error = err;
          return false;
        });
        if (canActivate) {
          return true;
        }
      }
      throw error;
    } else {
      for (const guard of guards) {
        const canActivate = await Promise.resolve(
          guard.canActivate(context),
        ).catch((err) => {
          error = err;
          return false;
        });
        if (!canActivate) {
          throw error;
        }
      }
    }
    return true;
  }
}
