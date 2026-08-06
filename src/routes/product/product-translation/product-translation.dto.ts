import { createZodDto } from "nestjs-zod";
import {
  CreateProductTranslationBodySchema,
  GetProductTranslationDetailResponseSchema,
  GetProductTranslationParamsSchema,
  UpdateProductTranslationBodySchema,
} from "./product-translation.model";

export class GetProductTranslationParamsDto extends createZodDto(
  GetProductTranslationParamsSchema,
) {}
export class GetProductTranslationDetailResponseDto extends createZodDto(
  GetProductTranslationDetailResponseSchema,
) {}
export class CreateProductTranslationBodyDto extends createZodDto(
  CreateProductTranslationBodySchema,
) {}
export class UpdateProductTranslationBodyDto extends createZodDto(
  UpdateProductTranslationBodySchema,
) {}
