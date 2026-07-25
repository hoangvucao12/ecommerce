import { UnprocessableEntityException } from "@nestjs/common";

//OTP
export const InvalidOTPException = new UnprocessableEntityException([
  {
    field: "code",
    message: "Error.InvalidOTP",
  },
]);

export const OTPExpiredException = new UnprocessableEntityException([
  {
    field: "code",
    message: "Error.OTPExpired",
  },
]);

export const FailedToSendOTPException = new UnprocessableEntityException([
  {
    field: "code",
    message: "Error.FailedToSendOTP",
  },
]);

//Email
export const EmailAlreadyExistsException = new UnprocessableEntityException([
  {
    field: "email",
    message: "Error.EmailAlreadyExists",
  },
]);

export const EmailNotFoundException = new UnprocessableEntityException([
  {
    field: "email",
    message: "Error.EmailNotFound",
  },
]);

//Password
export const InvalidPasswordException = new UnprocessableEntityException([
  {
    field: "password",
    message: "Error.InvalidPassword",
  },
]);

//Token
export const RefreshTokenAlreadyUsedException =
  new UnprocessableEntityException([
    {
      field: "refreshToken",
      message: "Error.RefreshTokenAlreadyUsed",
    },
  ]);

export const UnauthorizedAccessException = new UnprocessableEntityException([
  {
    field: "accessToken",
    message: "Error.UnauthorizedAccess",
  },
]);

//Google
export const GoogleUserInfoError = new UnprocessableEntityException([
  {
    field: "google",
    message: "Error.FaildToGetGoogleUserInfo",
  },
]);

//2FA
export const TOTPAlreadyEnabledException = new UnprocessableEntityException([
  {
    field: "totpCode",
    message: "Error.TOTPAlreadyEnabled",
  },
]);

export const TOTPNotEnabledException = new UnprocessableEntityException([
  {
    field: "totpCode",
    message: "Error.TOTPNotEnabled",
  },
]);

export const InvalidTOTPAndCodeException = new UnprocessableEntityException([
  {
    field: "totpCode",
    message: "Error.InvalidTOTPAndCode",
  },
  {
    field: "code",
    message: "Error.InvalidTOTPAndCode",
  },
]);

export const InvalidTOTPException = new UnprocessableEntityException([
  {
    field: "totpCode",
    message: "Error.InvalidTOTP",
  },
]);
