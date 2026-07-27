import { createZodDto } from "nestjs-zod";
import {
  GetUserProfileResponseSchema,
  UpdateProfileResponseSchema,
} from "../models/shared-user.model";

/**
 * GET("profile") và GET("user/:userId")
 */
export class GetUserProfileResponseDto extends createZodDto(
  GetUserProfileResponseSchema,
) {}

/**
 * PUT("profile") và PUT("user/:userId")
 */
export class UpdateProfileResponseDto extends createZodDto(
  UpdateProfileResponseSchema,
) {}
