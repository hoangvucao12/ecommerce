import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { REQUEST_USER_KEY } from "../constants/auth.constant";
import { AccessTokenPayload } from "../types/jwt.type";

export const ActiveUser = createParamDecorator(
  <TKey extends keyof AccessTokenPayload>(
    field: TKey | undefined,
    context: ExecutionContext,
  ): AccessTokenPayload | AccessTokenPayload[TKey] | undefined => {
    const request = context.switchToHttp().getRequest<{
      [REQUEST_USER_KEY]?: AccessTokenPayload;
    }>();

    const user = request[REQUEST_USER_KEY];

    return field !== undefined ? user?.[field] : user;
  },
);
