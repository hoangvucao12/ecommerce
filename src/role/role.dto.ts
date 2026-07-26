import { createZodDto } from "nestjs-zod";
import {
  GetRolesResponseSchema,
  GetRoleQuerySchema,
  GetRoleParamsSchema,
  GetRoleDetailResponseSchema,
  CreateRoleBodySchema,
  UpdateRoleBodySchema,
  CreateRoleResponseSchema,
} from "./role.model";

export class GetRolesResponseDto extends createZodDto(GetRolesResponseSchema) {}
export class GetRoleQueryDto extends createZodDto(GetRoleQuerySchema) {}
export class GetRoleParamsDto extends createZodDto(GetRoleParamsSchema) {}
export class GetRoleDetailResponseDto extends createZodDto(
  GetRoleDetailResponseSchema,
) {}
export class CreateRoleBodyDto extends createZodDto(CreateRoleBodySchema) {}
export class CreateRoleResponseDto extends createZodDto(
  CreateRoleResponseSchema,
) {}
export class UpdateRoleBodyDto extends createZodDto(UpdateRoleBodySchema) {}
