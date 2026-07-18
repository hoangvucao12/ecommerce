import {
  ConditionGuardType,
  AuthTypeType,
  AuthType,
  ConditionGuard,
} from "../constants/auth.constant";
import { SetMetadata } from "@nestjs/common";

export const AUTH_TYPE_KEY = "authType";

export type AUTH_TYPE_DECORATOR_PAYLOAD = {
  AuthTypes: AuthTypeType[];
  options: { condition: ConditionGuardType };
};

export const Auth = (
  AuthTypes: AuthTypeType[],
  options?: { condition: ConditionGuardType },
) => {
  return SetMetadata(AUTH_TYPE_KEY, {
    AuthTypes,
    options: options ?? { condition: ConditionGuard.And },
  });
};

export const IsPublic = () => Auth([AuthType.None]);
