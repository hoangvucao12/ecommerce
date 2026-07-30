import { createZodDto } from "nestjs-zod";
import {
  PresignedUploadFileBodySchema,
  PresignedUploadFileResponseSchema,
  UploadFileResponseSchema,
} from "./media.model";

export class PresignedUploadFileBodyDto extends createZodDto(
  PresignedUploadFileBodySchema,
) {}
export class UploadFileResponseDto extends createZodDto(
  UploadFileResponseSchema,
) {}
export class PresignedUploadFileResponseDto extends createZodDto(
  PresignedUploadFileResponseSchema,
) {}
