import { createZodDto } from "nestjs-zod";
import {
  CreateCategoryBodySchema,
  CreateCategoryResponseSchema,
  GetCategoriesQuerySchema,
  GetCategoriesResponseSchema,
  GetCategoryDetailResponseSchema,
  GetCategoryParamsSchema,
  UpdateCategoryBodySchema,
} from "./category.model";

export class GetCategoriesQueryDto extends createZodDto(
  GetCategoriesQuerySchema,
) {}
export class GetCategoryParamsDto extends createZodDto(
  GetCategoryParamsSchema,
) {}
export class CreateCategoryBodyDto extends createZodDto(
  CreateCategoryBodySchema,
) {}
export class CreateCategoryResponseDto extends createZodDto(
  CreateCategoryResponseSchema,
) {}
export class UpdateCategoryBodyDto extends createZodDto(
  UpdateCategoryBodySchema,
) {}
export class GetCategoryDetailResponseDto extends createZodDto(
  GetCategoryDetailResponseSchema,
) {}
export class GetCategoriesResponseDto extends createZodDto(
  GetCategoriesResponseSchema,
) {}
