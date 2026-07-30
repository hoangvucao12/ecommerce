import { createZodDto } from "nestjs-zod";
import {
  CreateBrandBodySchema,
  CreateBrandResponseSchema,
  GetBrandDetailResponseSchema,
  GetBrandParamsSchema,
  GetBrandQuerySchema,
  GetBrandsResponseSchema,
  UpdateBrandBodySchema,
} from "./brand.model";

export class GetBrandQueryDto extends createZodDto(GetBrandQuerySchema) {}
export class GetBrandParamsDto extends createZodDto(GetBrandParamsSchema) {}
export class CreateBrandBodyDto extends createZodDto(CreateBrandBodySchema) {}
export class CreateBrandResponseDto extends createZodDto(
  CreateBrandResponseSchema,
) {}
export class UpdateBrandBodyDto extends createZodDto(UpdateBrandBodySchema) {}
export class GetBrandDetailResponseDto extends createZodDto(
  GetBrandDetailResponseSchema,
) {}
export class GetBrandsResponseDto extends createZodDto(
  GetBrandsResponseSchema,
) {}
