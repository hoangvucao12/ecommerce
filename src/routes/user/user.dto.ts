import { createZodDto } from "nestjs-zod";
import {
  CreateUserBodySchema,
  GetUserParamsSchema,
  GetUserQuerySchema,
  GetUserResponseSchema,
  UpdateUserBodySchema,
} from "./user.model";
import { UpdateProfileResponseDto } from "src/shared/dtos/shared-user.dto";

export class GetUserQueryDto extends createZodDto(GetUserQuerySchema) {}
export class GetUserParamsDto extends createZodDto(GetUserParamsSchema) {}
export class CreateUserBodyDto extends createZodDto(CreateUserBodySchema) {}
export class CreateUserResponseDto extends UpdateProfileResponseDto {}
export class UpdateUserBodyDto extends createZodDto(UpdateUserBodySchema) {}
export class GetUserResponseDto extends createZodDto(GetUserResponseSchema) {}
