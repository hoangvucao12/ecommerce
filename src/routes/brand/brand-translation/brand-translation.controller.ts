import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from "@nestjs/common";
import { BrandTranslationService } from "./brand-translation.service";
import { ZodSerializerDto } from "nestjs-zod";
import {
  CreateBrandTranslationBodyDto,
  GetBrandTranslationDetailResponseDto,
  GetBrandTranslationParamsDto,
  UpdateBrandTranslationBodyDto,
} from "./brand-translation.dto";
import { ActiveUser } from "src/shared/decorators/active-user.decorator";
import { MessageResponseDto } from "src/shared/dtos/response.dto";

@Controller("brand-translation")
export class BrandTranslationController {
  constructor(
    private readonly brandTranslationService: BrandTranslationService,
  ) {}

  @Get(":brandTranslationId")
  @ZodSerializerDto(GetBrandTranslationDetailResponseDto)
  findById(@Param() params: GetBrandTranslationParamsDto) {
    return this.brandTranslationService.findById(params.brandTranslationId);
  }

  @Post()
  @ZodSerializerDto(GetBrandTranslationDetailResponseDto)
  create(
    @Body() body: CreateBrandTranslationBodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.brandTranslationService.create({
      createdById: userId,
      data: body,
    });
  }

  @Put(":brandTranslationId")
  @ZodSerializerDto(GetBrandTranslationDetailResponseDto)
  update(
    @Body() body: UpdateBrandTranslationBodyDto,
    @Param() params: GetBrandTranslationParamsDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.brandTranslationService.update({
      updatedById: userId,
      id: params.brandTranslationId,
      data: body,
    });
  }

  @Delete(":brandTranslationId")
  @ZodSerializerDto(MessageResponseDto)
  delete(@Param() params: GetBrandTranslationParamsDto) {
    return this.brandTranslationService.delete(params.brandTranslationId);
  }
}
