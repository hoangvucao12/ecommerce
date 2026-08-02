import { z } from "zod";

export const ProductTranslationSchema = z.object({
  id: z.number(),
  productId: z.number(),
  name: z.string(),
  description: z.string(),
  languageId: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
});

export const GetProductTranslationParamsSchema = z
  .object({
    productTranslationId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetProductTranslationDetailResponseSchema =
  ProductTranslationSchema;

export const CreateProductTranslationBodySchema = ProductTranslationSchema.pick(
  {
    productId: true,
    name: true,
    description: true,
    languageId: true,
  },
).strict();

export const UpdateProductTranslationBodySchema =
  CreateProductTranslationBodySchema;

export const DeleteProductTranslationParamsSchema =
  GetProductTranslationParamsSchema;

export type ProductTranslationType = z.infer<typeof ProductTranslationSchema>;
export type GetProductTranslationParamsType = z.infer<
  typeof GetProductTranslationParamsSchema
>;
export type GetProductTranslationDetailResponseType = z.infer<
  typeof GetProductTranslationDetailResponseSchema
>;
export type CreateProductTranslationBodyType = z.infer<
  typeof CreateProductTranslationBodySchema
>;
export type UpdateProductTranslationBodyType = z.infer<
  typeof UpdateProductTranslationBodySchema
>;
export type DeleteProductTranslationParamsType = z.infer<
  typeof DeleteProductTranslationParamsSchema
>;
