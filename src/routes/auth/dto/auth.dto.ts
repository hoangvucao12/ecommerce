import { createZodDto } from "nestjs-zod";

import {
  Disable2FABodySchema,
  ForgotPasswordBodySchema,
  GetAuthorizationUrlResponseSchema,
  GoogleCallbackQuerySchema,
  LoginBodySchema,
  RegisterBodySchema,
  RegisterResponseSchema,
  SendOtpBodySchema,
  Setup2FAResponseSchema,
  TokenResponseSchema,
} from "../models/auth.model";

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}
export class SendOtpBodyDto extends createZodDto(SendOtpBodySchema) {}
export class LoginBodyDto extends createZodDto(LoginBodySchema) {}
export class TokenResponseDto extends createZodDto(TokenResponseSchema) {}
export class GetAuthorizationUrlResponseDto extends createZodDto(
  GetAuthorizationUrlResponseSchema,
) {}
export class GoogleCallbackQueryDto extends createZodDto(
  GoogleCallbackQuerySchema,
) {}
export class ForgotPasswordBodyDto extends createZodDto(
  ForgotPasswordBodySchema,
) {}
export class Disable2FABodyDto extends createZodDto(Disable2FABodySchema) {}
export class Setup2FAResponseDto extends createZodDto(Setup2FAResponseSchema) {}
