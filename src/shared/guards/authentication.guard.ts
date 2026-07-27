import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
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
    const authTypeValue = this.getAuthTypeValue(context);

    const guards = authTypeValue.AuthTypes.map((authType) => {
      const guard = this.authTypeGuardMap[authType];
      if (!guard) {
        throw new Error(`No guard found for auth type: ${authType}`);
      }
      return guard;
    });

    return authTypeValue.options.condition === ConditionGuard.Or
      ? this.HandleOrCondition(guards, context)
      : this.HandleAndCondition(guards, context);
  }

  private getAuthTypeValue(
    context: ExecutionContext,
  ): AUTH_TYPE_DECORATOR_PAYLOAD {
    return (
      this.reflector.getAllAndOverride<AUTH_TYPE_DECORATOR_PAYLOAD | undefined>(
        AUTH_TYPE_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? {
        AuthTypes: [AuthType.Bearer],
        options: { condition: ConditionGuard.And },
      }
    );
  }

  private async HandleOrCondition(
    guards: CanActivate[],
    context: ExecutionContext,
  ) {
    let lastError: any = null;
    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate(context);
        if (canActivate) {
          return true;
        }
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError instanceof HttpException) {
      throw lastError;
    }
    throw new UnauthorizedException();
  }

  private async HandleAndCondition(
    guards: CanActivate[],
    context: ExecutionContext,
  ) {
    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate(context);
        if (!canActivate) {
          throw new UnauthorizedException();
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new UnauthorizedException();
      }
    }
    return true;
  }
}
