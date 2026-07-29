import { createZodDto } from "nestjs-zod";
import {
  CreateLanguageBodySchema,
  GetLanguageDetailResponseSchema,
  GetLanguageParamsSchema,
  GetLanguageResponseSchema,
  UpdateLanguageBodySchema,
} from "./language.model";

export class GetLanguageResponseDto extends createZodDto(
  GetLanguageResponseSchema,
) {}
export class GetLanguageParamsDto extends createZodDto(
  GetLanguageParamsSchema,
) {}
export class GetLanguageDetailResponseDto extends createZodDto(
  GetLanguageDetailResponseSchema,
) {}
export class CreateLanguageBodyDto extends createZodDto(
  CreateLanguageBodySchema,
) {}
export class UpdateLanguageBodyDto extends createZodDto(
  UpdateLanguageBodySchema,
) {}
