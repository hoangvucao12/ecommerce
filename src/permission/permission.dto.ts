import { createZodDto } from "nestjs-zod";
import {
  GetPermissionQuerySchema,
  UpdatePermissionBodySchema,
  CreatePermissionBodySchema,
  GetPermissionDetailResponseSchema,
  GetPermissionParamsSchema,
  GetPermissionResponseSchema,
} from "./permission.model";

export class GetPermissionResponseDto extends createZodDto(
  GetPermissionResponseSchema,
) {}
export class GetPermissionQueryDto extends createZodDto(
  GetPermissionQuerySchema,
) {}
export class GetPermissionParamsDto extends createZodDto(
  GetPermissionParamsSchema,
) {}
export class GetPermissionDetailResponseDto extends createZodDto(
  GetPermissionDetailResponseSchema,
) {}
export class CreatePermissionBodyDto extends createZodDto(
  CreatePermissionBodySchema,
) {}
export class UpdatePermissionBodyDto extends createZodDto(
  UpdatePermissionBodySchema,
) {}
