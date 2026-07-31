import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import {
  BrandType,
  CreateBrandBodyType,
  GetBrandDetailResponseType,
  GetBrandQueryType,
  GetBrandsResponseType,
  UpdateBrandBodyType,
} from "./brand.model";
import { ALL_LANGUAGE_CODE } from "src/shared/constants/other.constant";

@Injectable()
export class BrandRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(
    pagination: GetBrandQueryType,
    languageId: string,
  ): Promise<GetBrandsResponseType> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.brand.count({
        where: { deletedAt: null },
      }),
      this.prismaService.brand.findMany({
        where: { deletedAt: null },
        skip,
        take,
        include: {
          brandTranslations: {
            where:
              languageId === ALL_LANGUAGE_CODE
                ? { deletedAt: null }
                : { languageId, deletedAt: null },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    };
  }

  findById(
    id: number,
    languageId: string,
  ): Promise<GetBrandDetailResponseType | null> {
    return this.prismaService.brand.findUnique({
      where: { id, deletedAt: null },
      include: {
        brandTranslations: {
          where:
            languageId === ALL_LANGUAGE_CODE
              ? { deletedAt: null }
              : { languageId, deletedAt: null },
        },
      },
    });
  }

  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateBrandBodyType;
  }): Promise<BrandType> {
    return this.prismaService.brand.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  update({
    updatedById,
    id,
    data,
  }: {
    updatedById: number;
    id: number;
    data: UpdateBrandBodyType;
  }): Promise<GetBrandDetailResponseType> {
    return this.prismaService.brand.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
      },
      include: { brandTranslations: { where: { deletedAt: null } } },
    });
  }

  async delete(id: number): Promise<BrandType> {
    const brand = await this.prismaService.brand.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return brand;
  }
}
