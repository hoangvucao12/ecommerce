import { createZodDto } from "nestjs-zod";
import {
  CreateProductBodySchema,
  GetProductDetailResponseSchema,
  GetProductParamsSchema,
  GetProductQuerySchema,
  GetProductsResponseSchema,
  ProductSchema,
  UpdateProductBodySchema,
} from "./product.model";

export class GetProductQueryDto extends createZodDto(GetProductQuerySchema) {}
export class GetProductParamsDto extends createZodDto(GetProductParamsSchema) {}
export class CreateProductBodyDto extends createZodDto(
  CreateProductBodySchema,
) {}
export class UpdateProductBodyDto extends createZodDto(
  UpdateProductBodySchema,
) {}
export class ProductResponseDto extends createZodDto(ProductSchema) {}
export class GetProductDetailResponseDto extends createZodDto(
  GetProductDetailResponseSchema,
) {}
export class GetProductsResponseDto extends createZodDto(
  GetProductsResponseSchema,
) {}
