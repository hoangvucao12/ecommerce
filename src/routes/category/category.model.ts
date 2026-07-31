import { z } from "zod";
import { CategoryTranslationSchema } from "./category-translation/category-translation.model";

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string().url().nullable(),
  parentCategoryId: z.number().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
});

export const CategoryIncludeTranslationsSchema = CategorySchema.extend({
  categoryTranslations: z.array(CategoryTranslationSchema),
});

export const GetCategoriesResponseSchema = z.object({
  data: z.array(CategoryIncludeTranslationsSchema),
  totalItems: z.number(),
});

export const GetCategoriesQuerySchema = z
  .object({
    parentCategoryId: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const GetCategoryParamsSchema = z
  .object({
    categoryId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetCategoryDetailResponseSchema =
  CategoryIncludeTranslationsSchema;

export const CreateCategoryBodySchema = CategorySchema.pick({
  name: true,
  logo: true,
  parentCategoryId: true,
}).strict();

export const CreateCategoryResponseSchema = CategorySchema;

export const UpdateCategoryBodySchema = CreateCategoryBodySchema;

export type CategoryType = z.infer<typeof CategorySchema>;
export type CategoryIncludeTranslationsType = z.infer<
  typeof CategoryIncludeTranslationsSchema
>;
export type GetCategoriesResponseType = z.infer<
  typeof GetCategoriesResponseSchema
>;
export type GetCategoriesQueryType = z.infer<typeof GetCategoriesQuerySchema>;
export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>;
export type GetCategoryDetailResponseType = z.infer<
  typeof GetCategoryDetailResponseSchema
>;
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>;
export type CreateCategoryResponseType = z.infer<
  typeof CreateCategoryResponseSchema
>;
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>;
