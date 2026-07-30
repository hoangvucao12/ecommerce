import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from "@nestjs/common";
import { BrandService } from "./brand.service";
import { ZodSerializerDto } from "nestjs-zod";
import {
  CreateBrandBodyDto,
  CreateBrandResponseDto,
  GetBrandDetailResponseDto,
  GetBrandParamsDto,
  GetBrandQueryDto,
  GetBrandsResponseDto,
  UpdateBrandBodyDto,
} from "./brand.dto";
import { ActiveUser } from "src/shared/decorators/active-user.decorator";
import { MessageResponseDto } from "src/shared/dtos/response.dto";
import { IsPublic } from "src/shared/decorators/auth.decorator";

@Controller("brands")
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ZodSerializerDto(GetBrandsResponseDto)
  @IsPublic()
  list(@Query() pagination: GetBrandQueryDto) {
    return this.brandService.list(pagination);
  }

  @Get(":brandId")
  @ZodSerializerDto(GetBrandDetailResponseDto)
  @IsPublic()
  findById(@Param() params: GetBrandParamsDto) {
    return this.brandService.findById(params.brandId);
  }

  @Post()
  @ZodSerializerDto(CreateBrandResponseDto)
  create(
    @Body() body: CreateBrandBodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.brandService.create({
      createdById: userId,
      data: body,
    });
  }

  @Put(":brandId")
  @ZodSerializerDto(GetBrandDetailResponseDto)
  update(
    @Body() body: UpdateBrandBodyDto,
    @Param() params: GetBrandParamsDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.brandService.update({
      updatedById: userId,
      id: params.brandId,
      data: body,
    });
  }

  @Delete(":brandId")
  @ZodSerializerDto(MessageResponseDto)
  delete(@Param() params: GetBrandParamsDto) {
    return this.brandService.delete(params.brandId);
  }
}
