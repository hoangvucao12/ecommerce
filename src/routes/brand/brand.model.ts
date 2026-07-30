import { z } from "zod";
import { BrandTranslationSchema } from "./brand-translation/brand-translation.model";

export const BrandSchema = z.object({
  id: z.number(),
  name: z.string().max(255),
  logo: z.string().url().max(500),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
});

export const BrandIncludeTranslationSchema = BrandSchema.extend({
  brandTranslations: z.array(BrandTranslationSchema),
});

export const GetBrandsResponseSchema = z.object({
  data: z.array(BrandIncludeTranslationSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const GetBrandQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict();

export const GetBrandParamsSchema = z
  .object({
    brandId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetBrandDetailResponseSchema = BrandIncludeTranslationSchema;

export const CreateBrandBodySchema = BrandSchema.pick({
  name: true,
  logo: true,
}).strict();

export const CreateBrandResponseSchema = BrandSchema;

export const UpdateBrandBodySchema = CreateBrandBodySchema;

export type BrandType = z.infer<typeof BrandSchema>;
export type BrandTranslationType = z.infer<typeof BrandTranslationSchema>;
export type BrandIncludeTranslationType = z.infer<
  typeof BrandIncludeTranslationSchema
>;
export type GetBrandsResponseType = z.infer<typeof GetBrandsResponseSchema>;
export type GetBrandQueryType = z.infer<typeof GetBrandQuerySchema>;
export type GetBrandParamsType = z.infer<typeof GetBrandParamsSchema>;
export type GetBrandDetailResponseType = z.infer<
  typeof GetBrandDetailResponseSchema
>;
export type CreateBrandBodyType = z.infer<typeof CreateBrandBodySchema>;
export type UpdateBrandBodyType = z.infer<typeof UpdateBrandBodySchema>;
