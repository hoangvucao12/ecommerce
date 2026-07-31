import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { CategoryTranslationService } from "./category-translation.service";
import { ZodSerializerDto } from "nestjs-zod";
import {
  CreateCategoryTranslationBodyDto,
  GetCategoryTranslationDetailResponseDto,
  GetCategoryTranslationParamsDto,
  UpdateCategoryTranslationBodyDto,
} from "./category-translation.dto";
import { ActiveUser } from "../../../shared/decorators/active-user.decorator";
import { MessageResponseDto } from "../../../shared/dtos/response.dto";

@Controller("category-translation")
export class CategoryTranslationController {
  constructor(
    private readonly categoryTranslationService: CategoryTranslationService,
  ) {}

  @Get(":categoryTranslationId")
  @ZodSerializerDto(GetCategoryTranslationDetailResponseDto)
  findById(@Param() params: GetCategoryTranslationParamsDto) {
    return this.categoryTranslationService.findById(
      params.categoryTranslationId,
    );
  }

  @Post()
  @ZodSerializerDto(GetCategoryTranslationDetailResponseDto)
  create(
    @Body() body: CreateCategoryTranslationBodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.categoryTranslationService.create({
      createdById: userId,
      data: body,
    });
  }

  @Put(":categoryTranslationId")
  @ZodSerializerDto(GetCategoryTranslationDetailResponseDto)
  update(
    @Body() body: UpdateCategoryTranslationBodyDto,
    @Param() params: GetCategoryTranslationParamsDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.categoryTranslationService.update({
      updatedById: userId,
      id: params.categoryTranslationId,
      data: body,
    });
  }

  @Delete(":categoryTranslationId")
  @ZodSerializerDto(MessageResponseDto)
  delete(@Param() params: GetCategoryTranslationParamsDto) {
    return this.categoryTranslationService.delete(params.categoryTranslationId);
  }
}
