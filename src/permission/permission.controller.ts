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
import { PermissionService } from "./permission.service";
import { ZodSerializerDto } from "nestjs-zod";
import {
  CreatePermissionBodyDto,
  GetPermissionDetailResponseDto,
  GetPermissionParamsDto,
  GetPermissionQueryDto,
  GetPermissionResponseDto,
  UpdatePermissionBodyDto,
} from "./permission.dto";
import { ActiveUser } from "src/shared/decorators/active-user.decorator";
import { MessageResponseDto } from "src/shared/dtos/response.dto";

@Controller("permissions")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ZodSerializerDto(GetPermissionResponseDto)
  list(@Query() pagination: GetPermissionQueryDto) {
    return this.permissionService.list(pagination);
  }

  @Get(":permissionId")
  @ZodSerializerDto(GetPermissionDetailResponseDto)
  findById(@Param() params: GetPermissionParamsDto) {
    return this.permissionService.findById(params.permissionId);
  }

  @Post()
  @ZodSerializerDto(GetPermissionDetailResponseDto)
  create(
    @Body() body: CreatePermissionBodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.permissionService.create({
      createdById: userId,
      data: body,
    });
  }

  @Put(":permissionId")
  @ZodSerializerDto(GetPermissionDetailResponseDto)
  update(
    @Body() body: UpdatePermissionBodyDto,
    @Param() params: GetPermissionParamsDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.permissionService.update({
      updatedById: userId,
      id: params.permissionId,
      data: body,
    });
  }

  @Delete(":permissionId")
  @ZodSerializerDto(MessageResponseDto)
  delete(@Param() params: GetPermissionParamsDto) {
    return this.permissionService.delete(params.permissionId);
  }
}
