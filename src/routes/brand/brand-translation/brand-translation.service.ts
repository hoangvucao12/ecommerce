import { Injectable } from "@nestjs/common";
import { BrandTranslationRepository } from "./brand-translation.repo";
import {
  CreateBrandTranslationBodyType,
  UpdateBrandTranslationBodyType,
} from "./brand-translation.model";
import { NotFoundRecordException } from "src/shared/error";
import {
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from "src/shared/helpers";
import { BrandTranslationAlreadyExistsException } from "./brand-translation.error";

@Injectable()
export class BrandTranslationService {
  constructor(
    private readonly brandTranslationRepository: BrandTranslationRepository,
  ) {}

  async findById(id: number) {
    const translation = await this.brandTranslationRepository.findById(id);
    if (!translation) {
      throw NotFoundRecordException;
    }
    return translation;
  }

  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateBrandTranslationBodyType;
  }) {
    try {
      return await this.brandTranslationRepository.create({
        createdById,
        data,
      });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw BrandTranslationAlreadyExistsException;
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
    data: UpdateBrandTranslationBodyType;
  }) {
    try {
      const translation = await this.brandTranslationRepository.findById(id);
      if (!translation) {
        throw NotFoundRecordException;
      }
      return await this.brandTranslationRepository.update({
        updatedById,
        id,
        data,
      });
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw BrandTranslationAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const translation = await this.brandTranslationRepository.findById(id);
      if (!translation) {
        throw NotFoundRecordException;
      }
      await this.brandTranslationRepository.delete(id);
      return { message: "Brand translation deleted successfully" };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
