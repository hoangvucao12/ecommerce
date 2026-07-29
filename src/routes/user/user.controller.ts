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
import { UserService } from "./user.service";
import { ZodSerializerDto } from "nestjs-zod";
import {
  CreateUserBodyDto,
  CreateUserResponseDto,
  GetUserParamsDto,
  GetUserQueryDto,
  GetUserResponseDto,
  UpdateUserBodyDto,
} from "./user.dto";
import { ActiveUser } from "src/shared/decorators/active-user.decorator";
import { MessageResponseDto } from "src/shared/dtos/response.dto";
import {
  GetUserProfileResponseDto,
  UpdateProfileResponseDto,
} from "src/shared/dtos/shared-user.dto";
import { ActiveRolePermissions } from "src/shared/decorators/active-role-permissions.decorator";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ZodSerializerDto(GetUserResponseDto)
  list(@Query() pagination: GetUserQueryDto) {
    return this.userService.list(pagination);
  }

  @Get(":id")
  @ZodSerializerDto(GetUserProfileResponseDto)
  findById(@Param() params: GetUserParamsDto) {
    return this.userService.findById(params.id);
  }

  @Post()
  @ZodSerializerDto(CreateUserResponseDto)
  create(
    @Body() body: CreateUserBodyDto,
    @ActiveUser("userId") userId: number,
    @ActiveRolePermissions("name") roleName: string,
  ) {
    return this.userService.create({
      createdById: userId,
      data: body,
      createdByRoleName: roleName,
    });
  }

  @Put(":id")
  @ZodSerializerDto(UpdateProfileResponseDto)
  update(
    @Body() body: UpdateUserBodyDto,
    @Param() params: GetUserParamsDto,
    @ActiveUser("userId") userId: number,
    @ActiveRolePermissions("name") roleName: string,
  ) {
    return this.userService.update({
      updatedById: userId,
      id: params.id,
      data: body,
      updatedByRoleName: roleName,
    });
  }

  @Delete(":id")
  @ZodSerializerDto(MessageResponseDto)
  delete(
    @Param() params: GetUserParamsDto,
    @ActiveRolePermissions("name") roleName: string,
    @ActiveUser("userId") userId: number,
  ) {
    return this.userService.delete({
      id: params.id,
      deletedByRoleName: roleName,
      deletedById: userId,
    });
  }
}
