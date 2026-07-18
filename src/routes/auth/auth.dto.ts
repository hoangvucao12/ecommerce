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
