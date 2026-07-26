import { z } from "zod";
import { HTTPMethod } from "../shared/constants/role.constant";

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string(),
  path: z.string().max(1000),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ]),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
});

export const GetPermissionResponseSchema = z.object({
  data: z.array(PermissionSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const GetPermissionQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict();

export const GetPermissionParamsSchema = z
  .object({
    permissionId: z.coerce.number(),
  })
  .strict();

export const GetPermissionDetailResponseSchema = PermissionSchema;

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  path: true,
  method: true,
}).strict();

export const UpdatePermissionBodySchema = CreatePermissionBodySchema;

export type PermissionType = z.infer<typeof PermissionSchema>;
export type GetPermissionResponseType = z.infer<
  typeof GetPermissionResponseSchema
>;
export type GetPermissionQueryType = z.infer<typeof GetPermissionQuerySchema>;
export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>;
export type GetPermissionDetailResponseType = z.infer<
  typeof GetPermissionDetailResponseSchema
>;
export type CreatePermissionBodyType = z.infer<
  typeof CreatePermissionBodySchema
>;
export type UpdatePermissionBodyType = z.infer<
  typeof UpdatePermissionBodySchema
>;
