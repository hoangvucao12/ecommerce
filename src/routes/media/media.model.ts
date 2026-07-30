import { z } from "zod";

export const PresignedUploadFileBodySchema = z
  .object({
    filename: z.string(),
    filesize: z
      .number()
      .max(5 * 1024 * 1024, "File size must be less than 5MB"),
  })
  .strict();

export const UploadFileResponseSchema = z.object({
  data: z.array(
    z.object({
      url: z.string(),
    }),
  ),
});

export const PresignedUploadFileResponseSchema = z.object({
  presignedUrl: z.string(),
  url: z.string(),
});

export type PresignedUploadFileBody = z.infer<
  typeof PresignedUploadFileBodySchema
>;
export type UploadFileResponse = z.infer<typeof UploadFileResponseSchema>;
export type PresignedUploadFileResponse = z.infer<
  typeof PresignedUploadFileResponseSchema
>;
