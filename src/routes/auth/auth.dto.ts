import { createZodDto } from "nestjs-zod";
import {
  LoginBodySchema,
  LoginResponseSchema,
  RefreshTokenResponseSchema,
  RegisterBodySchema,
  RegisterResponseSchema,
  SendOtpBodySchema,
  RefreshTokenBodySchema,
  LogoutBodySchema,
  GetAuthorizationUrlResponseSchema,
  ForgotPasswordBodySchema,
  Setup2FAResponseSchema,
  Disable2FABodySchema,
} from "./auth.model";

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}
export class SendOtpBodyDto extends createZodDto(SendOtpBodySchema) {}
export class LoginBodyDto extends createZodDto(LoginBodySchema) {}
export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}
export class RefreshTokenResponseDto extends createZodDto(
  RefreshTokenResponseSchema,
) {}
export class RefreshTokenBodyDto extends createZodDto(RefreshTokenBodySchema) {}
export class LogoutBodyDto extends createZodDto(LogoutBodySchema) {}
export class GetAuthorizationUrlResponseDto extends createZodDto(
  GetAuthorizationUrlResponseSchema,
) {}
export class ForgotPasswordBodyDto extends createZodDto(
  ForgotPasswordBodySchema,
) {}
export class Disable2FABodyDto extends createZodDto(Disable2FABodySchema) {}
export class Setup2FAResponseDto extends createZodDto(Setup2FAResponseSchema) {}
