import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorators/active-user.decorator";
import { IsPublic } from "src/shared/decorators/auth.decorator";
import { MessageResponseDto } from "src/shared/dtos/response.dto";
import {
  CreateProductBodyDto,
  GetProductDetailResponseDto,
  GetProductParamsDto,
  GetProductQueryDto,
  GetProductsResponseDto,
  ProductResponseDto,
  UpdateProductBodyDto,
} from "./product.dto";
import { ProductService } from "./product.service";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetProductsResponseDto)
  list(@Query() query: GetProductQueryDto) {
    return this.productService.list(query);
  }

  @Get(":productId")
  @IsPublic()
  @ZodSerializerDto(GetProductDetailResponseDto)
  findById(@Param() params: GetProductParamsDto) {
    return this.productService.findById(params.productId);
  }

  @Post()
  @ZodSerializerDto(GetProductDetailResponseDto)
  create(
    @Body() body: CreateProductBodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.productService.create({ createdById: userId, data: body });
  }

  @Put(":productId")
  @ZodSerializerDto(ProductResponseDto)
  update(
    @Param() params: GetProductParamsDto,
    @Body() body: UpdateProductBodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.productService.update({
      updatedById: userId,
      productId: params.productId,
      data: body,
    });
  }

  @Delete(":productId")
  @ZodSerializerDto(MessageResponseDto)
  delete(@Param() params: GetProductParamsDto) {
    return this.productService.delete(params.productId);
  }
}
