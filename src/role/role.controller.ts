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
import { RoleService } from "./role.service";
import { ZodSerializerDto } from "nestjs-zod";
import {
  CreateRoleBodyDto,
  CreateRoleResponseDto,
  GetRoleDetailResponseDto,
  GetRoleParamsDto,
  GetRoleQueryDto,
  GetRolesResponseDto,
  UpdateRoleBodyDto,
} from "./role.dto";
import { ActiveUser } from "src/shared/decorators/active-user.decorator";
import { MessageResponseDto } from "src/shared/dtos/response.dto";

@Controller("roles")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ZodSerializerDto(GetRolesResponseDto)
  list(@Query() pagination: GetRoleQueryDto) {
    return this.roleService.list(pagination);
  }

  @Get(":roleId")
  @ZodSerializerDto(GetRoleDetailResponseDto)
  findById(@Param() params: GetRoleParamsDto) {
    return this.roleService.findById(params.roleId);
  }

  @Post()
  @ZodSerializerDto(CreateRoleResponseDto)
  create(
    @Body() body: CreateRoleBodyDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.roleService.create({
      createdById: userId,
      data: body,
    });
  }

  @Put(":roleId")
  @ZodSerializerDto(GetRoleDetailResponseDto)
  update(
    @Body() body: UpdateRoleBodyDto,
    @Param() params: GetRoleParamsDto,
    @ActiveUser("userId") userId: number,
  ) {
    return this.roleService.update({
      updatedById: userId,
      id: params.roleId,
      data: body,
    });
  }

  @Delete(":roleId")
  @ZodSerializerDto(MessageResponseDto)
  delete(@Param() params: GetRoleParamsDto) {
    return this.roleService.delete(params.roleId);
  }
}
