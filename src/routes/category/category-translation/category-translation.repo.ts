import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/services/prisma.service";
import {
  CategoryTranslationType,
  CreateCategoryTranslationBodyType,
  GetCategoryTranslationDetailResponseType,
  UpdateCategoryTranslationBodyType,
} from "./category-translation.model";

@Injectable()
export class CategoryTranslationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(
    id: number,
  ): Promise<GetCategoryTranslationDetailResponseType | null> {
    return this.prismaService.categoryTranslation.findUnique({
      where: { id, deletedAt: null },
    });
  }

  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateCategoryTranslationBodyType;
  }): Promise<CategoryTranslationType> {
    return this.prismaService.categoryTranslation.create({
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
    data: UpdateCategoryTranslationBodyType;
  }): Promise<CategoryTranslationType> {
    return this.prismaService.categoryTranslation.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
      },
    });
  }

  delete(id: number): Promise<CategoryTranslationType> {
    return this.prismaService.categoryTranslation.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
