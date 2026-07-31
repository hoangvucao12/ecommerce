import { z } from "zod";

export const CategoryTranslationSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  languageId: z.string(),
  name: z.string().max(500),
  description: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
});

export const GetCategoryTranslationParamsSchema = z
  .object({
    categoryTranslationId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetCategoryTranslationDetailResponseSchema =
  CategoryTranslationSchema;

export const CreateCategoryTranslationBodySchema =
  CategoryTranslationSchema.pick({
    categoryId: true,
    languageId: true,
    name: true,
    description: true,
  }).strict();

export const UpdateCategoryTranslationBodySchema =
  CreateCategoryTranslationBodySchema;

export type CategoryTranslationType = z.infer<typeof CategoryTranslationSchema>;

export type GetCategoryTranslationParamsType = z.infer<
  typeof GetCategoryTranslationParamsSchema
>;
export type GetCategoryTranslationDetailResponseType = z.infer<
  typeof GetCategoryTranslationDetailResponseSchema
>;
export type CreateCategoryTranslationBodyType = z.infer<
  typeof CreateCategoryTranslationBodySchema
>;
export type UpdateCategoryTranslationBodyType = z.infer<
  typeof UpdateCategoryTranslationBodySchema
>;
