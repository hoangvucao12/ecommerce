import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import {
  CreateProductTranslationBodyType,
  GetProductTranslationDetailResponseType,
  ProductTranslationType,
  UpdateProductTranslationBodyType,
} from "./product-translation.model";

@Injectable()
export class ProductTranslationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(
    id: number,
  ): Promise<GetProductTranslationDetailResponseType | null> {
    return this.prismaService.productTranslation.findUnique({
      where: { id, deletedAt: null },
    });
  }

  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateProductTranslationBodyType;
  }): Promise<ProductTranslationType> {
    return this.prismaService.productTranslation.create({
      data: { ...data, createdById },
    });
  }

  update({
    updatedById,
    id,
    data,
  }: {
    updatedById: number;
    id: number;
    data: UpdateProductTranslationBodyType;
  }): Promise<ProductTranslationType> {
    return this.prismaService.productTranslation.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById },
    });
  }

  delete(id: number): Promise<ProductTranslationType> {
    return this.prismaService.productTranslation.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
