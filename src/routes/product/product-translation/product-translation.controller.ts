import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorators/active-user.decorator";
import { MessageResponseDto } from "src/shared/dtos/response.dto";
import {
  CreateProductTranslationBodyDto,
  GetProductTranslationDetailResponseDto,
  GetProductTranslationParamsDto,
  UpdateProductTranslationBodyDto,
} from "./product-translation.dto";
import { ProductTranslationService } from "./product-translation.service";

@Controller("product-translation")
export class ProductTranslationController {
  constructor(
    private readonly productTranslationService: ProductTranslationService,
  ) {}

  @Get(":productTranslationId")
  @ZodSerializerDto(GetProductTranslationDetailResponseDto)
  findById(@Param() params: GetProductTranslationParamsDto) {
    return this.productTranslationService.findById(params.productTranslationId);
  }

  @Post()
  @ZodSerializerDto(GetProductTranslationDetailResponseDto)
  create(
    @Body() body: CreateProductTranslationBodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.productTranslationService.create({
      createdById: userId,
      data: body,
    });
  }

  @Put(":productTranslationId")
  @ZodSerializerDto(GetProductTranslationDetailResponseDto)
  update(
    @Param() params: GetProductTranslationParamsDto,
    @Body() body: UpdateProductTranslationBodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.productTranslationService.update({
      updatedById: userId,
      id: params.productTranslationId,
      data: body,
    });
  }

  @Delete(":productTranslationId")
  @ZodSerializerDto(MessageResponseDto)
  delete(@Param() params: GetProductTranslationParamsDto) {
    return this.productTranslationService.delete(params.productTranslationId);
  }
}
