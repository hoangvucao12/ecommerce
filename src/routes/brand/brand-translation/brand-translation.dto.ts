import { createZodDto } from "nestjs-zod";
import {
  CreateBrandTranslationBodySchema,
  GetBrandTranslationDetailResponseSchema,
  GetBrandTranslationParamsSchema,
  UpdateBrandTranslationBodySchema,
} from "./brand-translation.model";

export class GetBrandTranslationParamsDto extends createZodDto(
  GetBrandTranslationParamsSchema,
) {}
export class GetBrandTranslationDetailResponseDto extends createZodDto(
  GetBrandTranslationDetailResponseSchema,
) {}
export class CreateBrandTranslationBodyDto extends createZodDto(
  CreateBrandTranslationBodySchema,
) {}
export class UpdateBrandTranslationBodyDto extends createZodDto(
  UpdateBrandTranslationBodySchema,
) {}
