import { z } from "zod";
import { PermissionSchema } from "./shared-permission.model";

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
});

export const RolePermissionSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
});

export type RoleType = z.infer<typeof RoleSchema>;
export type RolePermissionType = z.infer<typeof RolePermissionSchema>;
