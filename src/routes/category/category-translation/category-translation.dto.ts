import { createZodDto } from "nestjs-zod";
import {
  CreateCategoryTranslationBodySchema,
  GetCategoryTranslationDetailResponseSchema,
  GetCategoryTranslationParamsSchema,
  UpdateCategoryTranslationBodySchema,
} from "./category-translation.model";

export class GetCategoryTranslationParamsDto extends createZodDto(
  GetCategoryTranslationParamsSchema,
) {}
export class GetCategoryTranslationDetailResponseDto extends createZodDto(
  GetCategoryTranslationDetailResponseSchema,
) {}
export class CreateCategoryTranslationBodyDto extends createZodDto(
  CreateCategoryTranslationBodySchema,
) {}
export class UpdateCategoryTranslationBodyDto extends createZodDto(
  UpdateCategoryTranslationBodySchema,
) {}
