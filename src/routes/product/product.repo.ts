import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import {
  CreateProductBodyType,
  GetProductDetailResponseType,
  GetProductQueryType,
  GetProductsResponseType,
  ProductType,
  UpdateProductBodyType,
} from "./product.model";
import { ALL_LANGUAGE_CODE } from "src/shared/constants/other.constant";

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(
    query: GetProductQueryType,
    languageId: string,
    createdById?: number,
    isPublic?: boolean,
  ): Promise<GetProductsResponseType> {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const where = {
      deletedAt: null,
      createdById: createdById ? createdById : undefined,
      publishAt: isPublic ? { lte: new Date(), not: null } : undefined,
    };

    const [totalItems, products] = await Promise.all([
      this.prismaService.product.count({
        where,
      }),
      this.prismaService.product.findMany({
        where,
        include: {
          productTranslations: {
            where:
              languageId === ALL_LANGUAGE_CODE
                ? { deletedAt: null }
                : { deletedAt: null, languageId },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);
    return {
      data: products,
      totalItems,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalItems / query.limit),
    };
  }

  findById(productId: number, languageId: string): Promise<ProductType | null> {
    return this.prismaService.product.findUnique({
      where: {
        id: productId,
        deletedAt: null,
      },
    });
  }

  // getDetail(
  //   productId: number,
  //   languageId: string,
  //   isPublic?: boolean,
  // ): Promise<GetProductDetailResponseType | null> {
  //   return this.prismaService.product.findUnique({
  //     where: {
  //       id: productId,
  //       deletedAt: null,
  //       publishAt: isPublic ? { lte: new Date(), not: null } : undefined,
  //     },
  //     include: {
  //       productTranslations: {
  //         where:
  //           languageId === ALL_LANGUAGE_CODE
  //             ? { deletedAt: null }
  //             : { deletedAt: null, languageId },
  //       },
  //       skus: {
  //         where: {
  //           deletedAt: null,
  //         },
  //       },
  //       brand: {
  //         include: {
  //           brandTranslations: {
  //             where:
  //               languageId === ALL_LANGUAGE_CODE
  //                 ? { deletedAt: null }
  //                 : { deletedAt: null, languageId },
  //           },
  //         },
  //       },
  //       categories: {
  //         where: {
  //           deletedAt: null,
  //         },
  //         include: {
  //           categoryTranslations: {
  //             where:
  //               languageId === ALL_LANGUAGE_CODE
  //                 ? { deletedAt: null }
  //                 : { deletedAt: null, languageId },
  //           },
  //         },
  //       },
  //     },
  //   });
  // }

  async delete(productId: number): Promise<ProductType> {
    const [product] = await Promise.all([
      this.prismaService.product.update({
        where: {
          id: productId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      }),
      this.prismaService.sKU.updateMany({
        where: {
          productId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      }),
    ]);
    return product;
  }

  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateProductBodyType;
  }): Promise<GetProductDetailResponseType> {
    const { skus, categories, ...productData } = data;

    return this.prismaService.product.create({
      data: {
        ...productData,
        createdById,
        categories: {
          connect: categories.map((categoryId) => ({ id: categoryId })),
        },
        skus: {
          createMany: {
            data: skus.map((sku) => ({
              ...sku,
              createdById,
            })),
          },
        },
      },
      include: {
        productTranslations: {
          where: {
            deletedAt: null,
          },
        },
        brand: {
          include: {
            brandTranslations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        skus: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  async update({
    updatedById,
    productId,
    data,
  }: {
    updatedById: number;
    productId: number;
    data: UpdateProductBodyType;
  }): Promise<ProductType> {
    const { skus, categories, ...productData } = data;

    const existingSKUs = await this.prismaService.sKU.findMany({
      where: {
        productId,
        deletedAt: null,
      },
    });

    const skusToDelete = existingSKUs.filter((sku) =>
      skus.every((dataSku) => dataSku.value !== sku.value),
    );
    const skuIdsToDelete = skusToDelete.map((sku) => sku.id);

    const skusWithId = skus.map((dataSku) => {
      const existingSku = existingSKUs.find(
        (existingSku) => existingSku.value === dataSku.value,
      );
      return {
        ...dataSku,
        id: existingSku ? existingSku.id : undefined,
      };
    });

    const skusToUpdate = skusWithId.filter((sku) => sku.id !== undefined);
    const skusToCreate = skusWithId
      .filter((sku) => sku.id === undefined)
      .map((sku) => {
        const { id, ...data } = sku;
        return {
          ...data,
          productId,
          createdById: updatedById,
        };
      });

    const [product] = await this.prismaService.$transaction([
      this.prismaService.product.update({
        where: {
          id: productId,
          deletedAt: null,
        },
        data: {
          ...productData,
          updatedById,
          categories: {
            connect: categories.map((categoryId) => ({ id: categoryId })),
          },
        },
      }),

      this.prismaService.sKU.updateMany({
        where: {
          id: {
            in: skuIdsToDelete,
          },
        },
        data: {
          deletedAt: new Date(),
        },
      }),

      ...skusToUpdate.map((sku) =>
        this.prismaService.sKU.update({
          where: {
            id: sku.id,
          },
          data: {
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            updatedById,
          },
        }),
      ),

      this.prismaService.sKU.createMany({
        data: skusToCreate,
      }),
    ]);

    return product;
  }
}
