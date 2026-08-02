import { z } from "zod";
import { BrandIncludeTranslationSchema } from "../brand/brand.model";
import { ProductTranslationSchema } from "./product-translation/product-translation.model";
import { SKUSchema, UpsertSKUBodySchema, UpsertSKUBodyType } from "./sku.model";
import { CategoryIncludeTranslationsSchema } from "../category/category.model";

function generateSKUs(variants: VariantsType): UpsertSKUBodyType[] {
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce<string[]>(
      (acc, curr) =>
        acc.flatMap((x) => curr.map((y) => `${x}${x ? "-" : ""}${y}`)),
      [""],
    );
  }

  const options = variants.map((variant) => variant.options);

  const combinations = getCombinations(options);

  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 100,
    images: [],
  }));
}

export const VariantSchema = z.object({
  value: z.string(),
  options: z.array(z.string()),
});

export const VariantsSchema = z
  .array(VariantSchema)
  .superRefine((variants, ctx) => {
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const isDifferent =
        variants.findIndex((v) => v.value === variant.value) !== i;
      if (isDifferent) {
        return ctx.addIssue({
          code: "custom",
          message: `Variant value "${variant.value}" is duplicated.`,
          path: ["variants"],
        });
      }
      const isDifferentOptions =
        variant.options.findIndex(
          (o, index) => variant.options.indexOf(o) !== index,
        ) !== -1;
      if (isDifferentOptions) {
        return ctx.addIssue({
          code: "custom",
          message: `Variant options for "${variant.value}" are duplicated.`,
          path: ["variants"],
        });
      }
    }
  });

export const ProductSchema = z.object({
  id: z.number(),
  publishedAt: z.coerce.date().nullable(),
  name: z.string(),
  basePrice: z.number().positive(),
  virtualPrice: z.number().positive(),
  brandId: z.number(),
  images: z.array(z.string()),
  variants: VariantsSchema,

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
});

export const GetProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  name: z.string().optional(),
  brandIds: z.array(z.coerce.number().int().positive()).optional(),
  categories: z.array(z.coerce.number().int().positive()).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

export const GetProductsResponseSchema = z.object({
  data: z.array(
    ProductSchema.extend({
      productTranslations: z.array(ProductTranslationSchema),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const GetProductParamsSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetProductDetailResponseSchema = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema),
  skus: z.array(SKUSchema),
  categories: z.array(CategoryIncludeTranslationsSchema),
  brand: BrandIncludeTranslationSchema,
});

export const CreateProductBodySchema = ProductSchema.pick({
  publishedAt: true,
  name: true,
  basePrice: true,
  virtualPrice: true,
  brandId: true,
  images: true,
  variants: true,
})
  .extend({
    categories: z.array(z.coerce.number().int().positive()),
    skus: z.array(UpsertSKUBodySchema).optional(),
  })
  .strict()
  .superRefine(({ variants, skus }, ctx) => {
    const skuValueArray = generateSKUs(variants);
    if (skus?.length !== skuValueArray.length) {
      return ctx.addIssue({
        code: "custom",
        message: `The number of SKUs (${skus?.length ?? 0}) does not match the number of generated SKUs (${skuValueArray.length}) based on the provided variants.`,
        path: ["skus"],
      });
    }

    let wrongSKUIndex = -1;
    const isValidSKUs = skus.every((sku, index) => {
      const isValid = sku.value === skuValueArray[index].value;
      if (!isValid) {
        wrongSKUIndex = index;
      }
      return isValid;
    });
    if (!isValidSKUs) {
      return ctx.addIssue({
        code: "custom",
        message: `The SKU value "${skus[wrongSKUIndex].value}" does not match the expected value "${skuValueArray[wrongSKUIndex].value}" based on the provided variants.`,
        path: ["skus"],
      });
    }
  });

export const UpdateProductBodySchema = CreateProductBodySchema;

export type ProductType = z.infer<typeof ProductSchema>;
export type GetProductQueryType = z.infer<typeof GetProductQuerySchema>;
export type GetProductsResponseType = z.infer<typeof GetProductsResponseSchema>;
export type GetProductParamsType = z.infer<typeof GetProductParamsSchema>;
export type GetProductDetailResponseType = z.infer<
  typeof GetProductDetailResponseSchema
>;
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>;
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>;
export type VariantType = z.infer<typeof VariantSchema>;
export type VariantsType = z.infer<typeof VariantsSchema>;
