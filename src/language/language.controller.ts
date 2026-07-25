import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from "@nestjs/common";
import { LanguageService } from "./language.service";
import { ZodSerializerDto } from "nestjs-zod";
import {
  CreateLanguageBodyDto,
  GetLanguageDetailResponseDto,
  GetLanguageParamsDto,
  GetLanguageResponseDto,
  UpdateLanguageBodyDto,
} from "./language.dto";
import { ActiveUser } from "src/shared/decorators/active-user.decorator";
import { MessageResponseDto } from "src/shared/dtos/response.dto";

@Controller("languages")
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @ZodSerializerDto(GetLanguageResponseDto)
  findAll() {
    return this.languageService.findAll();
  }

  @Get(":languageId")
  @ZodSerializerDto(GetLanguageDetailResponseDto)
  findById(@Param() params: GetLanguageParamsDto) {
    return this.languageService.findById(params.languageId);
  }

  @Post()
  @ZodSerializerDto(GetLanguageDetailResponseDto)
  create(
    @Body() body: CreateLanguageBodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.languageService.create({
      createdById: userId,
      data: body,
    });
  }

  @Put(":languageId")
  @ZodSerializerDto(GetLanguageDetailResponseDto)
  update(
    @Param() params: GetLanguageParamsDto,
    @Body() body: UpdateLanguageBodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.languageService.update({
      id: params.languageId,
      updatedById: userId,
      data: body,
    });
  }

  @Delete(":languageId")
  @ZodSerializerDto(MessageResponseDto)
  delete(@Param() params: GetLanguageParamsDto) {
    return this.languageService.delete(params.languageId);
  }
}
