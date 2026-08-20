import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";

import {
  REQUEST_ROLE_PERMISSIONS,
  REQUEST_USER_KEY,
  UserStatus,
} from "../constants/auth.constant";
import { PrismaService } from "../services/prisma.service";
import { TokenService } from "../services/token.service";
import { AccessTokenGuard } from "./access-token.guard";

describe("AccessTokenGuard", () => {
  const tokenService = { verifyAccessToken: jest.fn() };
  const findFirst = jest.fn();
  const prisma = { user: { findFirst } };
  const guard = new AccessTokenGuard(
    tokenService as unknown as TokenService,
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects an authorization header that is not Bearer", async () => {
    const context = createContext({
      headers: { authorization: "Basic abc" },
      method: "GET",
      route: { path: "/profile" },
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
  });

  it("loads current user, device, role and permissions instead of trusting JWT role", async () => {
    const request: Record<string, unknown> = {
      headers: { authorization: "Bearer access-token" },
      method: "GET",
      route: { path: "/profile" },
    };
    tokenService.verifyAccessToken.mockResolvedValue({
      userId: 1,
      deviceId: 5,
      roleId: 999,
      roleName: "STALE",
      exp: 1,
      iat: 1,
    });
    findFirst.mockResolvedValue({
      id: 1,
      status: UserStatus.Active,
      roleId: 2,
      role: {
        id: 2,
        name: "USER",
        isActive: true,
        deletedAt: null,
        permissions: [{ id: 10 }],
      },
    });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        // Jest asymmetric matchers are intentionally typed as any.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: expect.objectContaining({
          id: 1,
          status: UserStatus.Active,
          devices: { some: { id: 5, isActive: true } },
        }),
      }),
    );
    expect(request[REQUEST_USER_KEY]).toEqual(
      expect.objectContaining({ roleId: 2, roleName: "USER" }),
    );
    expect(request[REQUEST_ROLE_PERMISSIONS]).toEqual(
      expect.objectContaining({ id: 2 }),
    );
  });

  it("rejects a blocked, deleted or inactive current user", async () => {
    tokenService.verifyAccessToken.mockResolvedValue({
      userId: 1,
      deviceId: 5,
      roleId: 2,
      roleName: "USER",
    });
    findFirst.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        createContext({
          headers: { authorization: "Bearer access-token" },
          method: "GET",
          route: { path: "/profile" },
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

function createContext(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}
