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
import { CategoryService } from "./category.service";
import { ZodSerializerDto } from "nestjs-zod";
import {
  CreateCategoryBodyDto,
  GetCategoriesResponseDto,
  GetCategoryDetailResponseDto,
  GetCategoryParamsDto,
  GetCategoriesQueryDto,
  UpdateCategoryBodyDto,
} from "./category.dto";
import { ActiveUser } from "../../shared/decorators/active-user.decorator";
import { MessageResponseDto } from "../../shared/dtos/response.dto";
import { IsPublic } from "../../shared/decorators/auth.decorator";

@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ZodSerializerDto(GetCategoriesResponseDto)
  @IsPublic()
  list(@Query() query: GetCategoriesQueryDto) {
    return this.categoryService.findAll(query.parentCategoryId);
  }

  @Get(":categoryId")
  @ZodSerializerDto(GetCategoryDetailResponseDto)
  @IsPublic()
  findById(@Param() params: GetCategoryParamsDto) {
    return this.categoryService.findById(params.categoryId);
  }

  @Post()
  @ZodSerializerDto(GetCategoryDetailResponseDto)
  create(
    @Body() body: CreateCategoryBodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.categoryService.create({
      createdById: userId,
      data: body,
    });
  }

  @Put(":categoryId")
  @ZodSerializerDto(GetCategoryDetailResponseDto)
  update(
    @Body() body: UpdateCategoryBodyDto,
    @Param() params: GetCategoryParamsDto,
    @ActiveUser("userId") userId: number,
  ) {
    console.log("Controller");
    return this.categoryService.update({
      updatedById: userId,
      id: params.categoryId,
      data: body,
    });
  }

  @Delete(":categoryId")
  @ZodSerializerDto(MessageResponseDto)
  delete(@Param() params: GetCategoryParamsDto) {
    return this.categoryService.delete(params.categoryId);
  }
}
