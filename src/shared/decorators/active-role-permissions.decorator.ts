import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { REQUEST_ROLE_PERMISSIONS } from "src/shared/constants/auth.constant";
import { RolePermissionType } from "../models/shared-role.model";

export const ActiveRolePermissions = createParamDecorator(
  <TKey extends keyof RolePermissionType>(
    field: TKey | undefined,
    context: ExecutionContext,
  ): RolePermissionType | RolePermissionType[TKey] | undefined => {
    const request = context.switchToHttp().getRequest<{
      [REQUEST_ROLE_PERMISSIONS]?: RolePermissionType;
    }>();

    const rolePermissions = request[REQUEST_ROLE_PERMISSIONS];

    return field !== undefined ? rolePermissions?.[field] : rolePermissions;
  },
);
