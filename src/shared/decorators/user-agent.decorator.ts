import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserAgent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{
      headers?: Record<string, string | string[] | undefined>;
    }>();

    const userAgent = request.headers?.["user-agent"];

    return Array.isArray(userAgent) ? userAgent[0] : (userAgent ?? "");
  },
);
