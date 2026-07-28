export const REQUEST_USER_KEY = "user";
export const REQUEST_ROLE_PERMISSIONS = "role_permissions";

export const AuthType = {
  Bearer: "Bearer",
  None: "None",
  ApiKey: "ApiKey",
} as const;

export type AuthTypeType = (typeof AuthType)[keyof typeof AuthType];

export const ConditionGuard = {
  And: "AND",
  Or: "OR",
} as const;

export type ConditionGuardType =
  (typeof ConditionGuard)[keyof typeof ConditionGuard];

export const UserStatus = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
  Blocked: "BLOCKED",
} as const;

export const TypeOfVerificationCode = {
  Register: "REGISTER",
  ForgotPassword: "FORGOT_PASSWORD",
  Login: "LOGIN",
  Disable2FA: "DISABLE_2FA",
} as const;

export type TypeOfVerificationCodeType =
  (typeof TypeOfVerificationCode)[keyof typeof TypeOfVerificationCode];
