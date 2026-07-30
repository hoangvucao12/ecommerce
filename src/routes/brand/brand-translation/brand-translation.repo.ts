import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import {
  BrandTranslationType,
  CreateBrandTranslationBodyType,
  GetBrandTranslationDetailResponseType,
  UpdateBrandTranslationBodyType,
} from "./brand-translation.model";

@Injectable()
export class BrandTranslationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(id: number): Promise<GetBrandTranslationDetailResponseType | null> {
    return this.prismaService.brandTranslation.findUnique({
      where: { id, deletedAt: null },
    });
  }

  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateBrandTranslationBodyType;
  }): Promise<BrandTranslationType> {
    return this.prismaService.brandTranslation.create({
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
    data: UpdateBrandTranslationBodyType;
  }): Promise<BrandTranslationType> {
    return this.prismaService.brandTranslation.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
      },
    });
  }

  delete(id: number): Promise<BrandTranslationType> {
    return this.prismaService.brandTranslation.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
