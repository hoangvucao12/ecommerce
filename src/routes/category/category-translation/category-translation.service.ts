import { Injectable } from "@nestjs/common";
import { CategoryTranslationRepository } from "./category-translation.repo";
import {
  CreateCategoryTranslationBodyType,
  UpdateCategoryTranslationBodyType,
} from "./category-translation.model";
import { NotFoundRecordException } from "../../../shared/error";

@Injectable()
export class CategoryTranslationService {
  constructor(
    private readonly categoryTranslationRepository: CategoryTranslationRepository,
  ) {}

  async findById(id: number) {
    const translation = await this.categoryTranslationRepository.findById(id);
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
    data: CreateCategoryTranslationBodyType;
  }) {
    return await this.categoryTranslationRepository.create({
      createdById,
      data,
    });
  }

  async update({
    updatedById,
    id,
    data,
  }: {
    updatedById: number;
    id: number;
    data: UpdateCategoryTranslationBodyType;
  }) {
    try {
      const translation = await this.categoryTranslationRepository.findById(id);
      if (!translation) {
        throw NotFoundRecordException;
      }
      return await this.categoryTranslationRepository.update({
        updatedById,
        id,
        data,
      });
    } catch (error) {
      if ((error as { code?: string }).code === "P2025") {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const translation = await this.categoryTranslationRepository.findById(id);
      if (!translation) {
        throw NotFoundRecordException;
      }
      await this.categoryTranslationRepository.delete(id);
      return { message: "Category translation deleted successfully" };
    } catch (error) {
      if ((error as { code?: string }).code === "P2025") {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
