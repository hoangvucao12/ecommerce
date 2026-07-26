import { z } from "zod";

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
