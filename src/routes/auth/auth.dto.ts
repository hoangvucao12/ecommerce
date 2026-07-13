import { createZodDto } from "nestjs-zod";
import {
  RegisterBodySchema,
  RegisterResponseSchema,
  SendOtpBodySchema,
} from "./auth.model";

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}
export class SendOtpBodyDto extends createZodDto(SendOtpBodySchema) {}
