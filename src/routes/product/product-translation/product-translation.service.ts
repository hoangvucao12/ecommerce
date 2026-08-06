import { Injectable } from "@nestjs/common";
import { NotFoundRecordException } from "src/shared/error";
import {
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from "src/shared/helpers";
import { ProductTranslationAlreadyExistsException } from "./product-translation.error";
import {
  CreateProductTranslationBodyType,
  UpdateProductTranslationBodyType,
} from "./product-translation.model";
import { ProductTranslationRepository } from "./product-translation.repo";

@Injectable()
export class ProductTranslationService {
  constructor(
    private readonly productTranslationRepository: ProductTranslationRepository,
  ) {}

  async findById(id: number) {
    const translation = await this.productTranslationRepository.findById(id);
    if (!translation) throw NotFoundRecordException;
    return translation;
  }

  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateProductTranslationBodyType;
  }) {
    try {
      return await this.productTranslationRepository.create({
        createdById,
        data,
      });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw ProductTranslationAlreadyExistsException;
      }
      throw error;
    }
  }

  async update({
    updatedById,
    id,
    data,
  }: {
    updatedById: number;
    id: number;
    data: UpdateProductTranslationBodyType;
  }) {
    try {
      return await this.productTranslationRepository.update({
        updatedById,
        id,
        data,
      });
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      if (isUniqueConstraintPrismaError(error)) {
        throw ProductTranslationAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      await this.productTranslationRepository.delete(id);
      return { message: "Product translation deleted successfully" };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
