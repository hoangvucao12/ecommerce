import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import { ALL_LANGUAGE_CODE } from "src/shared/constants/other.constant";
import {
  CategoryType,
  CreateCategoryBodyType,
  GetCategoriesResponseType,
  GetCategoryDetailResponseType,
  UpdateCategoryBodyType,
} from "./category.model";

@Injectable()
export class CategoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll({
    parentCategoryId,
    languageId,
  }: {
    parentCategoryId?: number | null;
    languageId: string;
  }): Promise<GetCategoriesResponseType> {
    const categories = await this.prismaService.category.findMany({
      where: {
        parentCategoryId: parentCategoryId ?? null,
        deletedAt: null,
      },
      include: {
        categoryTranslations: {
          where:
            languageId === ALL_LANGUAGE_CODE
              ? { deletedAt: null }
              : { languageId, deletedAt: null },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { data: categories, totalItems: categories.length };
  }

  findById(
    id: number,
    languageId: string,
  ): Promise<GetCategoryDetailResponseType | null> {
    return this.prismaService.category.findUnique({
      where: { id, deletedAt: null },
      include: {
        categoryTranslations: {
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
    data: CreateCategoryBodyType;
  }): Promise<GetCategoryDetailResponseType> {
    return this.prismaService.category.create({
      data: {
        ...data,
        createdById,
      },
      include: {
        categoryTranslations: {
          where: { deletedAt: null },
        },
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
    data: UpdateCategoryBodyType;
  }): Promise<GetCategoryDetailResponseType> {
    return this.prismaService.category.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
      },
      include: {
        categoryTranslations: {
          where: { deletedAt: null },
        },
      },
    });
  }

  async delete(id: number): Promise<CategoryType> {
    return this.prismaService.category.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
