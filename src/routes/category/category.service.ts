import { Injectable } from "@nestjs/common";
import { CategoryRepository } from "./category.repo";
import {
  CreateCategoryBodyType,
  UpdateCategoryBodyType,
} from "./category.model";
import { NotFoundRecordException } from "../../shared/error";
import { I18nContext, I18nService, I18nTranslation } from "nestjs-i18n";
import { isNotFoundPrismaError } from "src/shared/helpers";

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly i18n: I18nService<I18nTranslation>,
  ) {}

  async findAll(parentCategoryId?: number | null) {
    return await this.categoryRepository.findAll({
      parentCategoryId,
      languageId: I18nContext.current()?.lang as string,
    });
  }

  async findById(id: number) {
    const category = await this.categoryRepository.findById(
      id,
      I18nContext.current()?.lang as string,
    );
    if (!category) {
      throw NotFoundRecordException;
    }
    return category;
  }

  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateCategoryBodyType;
  }) {
    try {
      return await this.categoryRepository.create({ createdById, data });
    } catch (error) {
      console.log(error);
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
    data: UpdateCategoryBodyType;
  }) {
    try {
      return await this.categoryRepository.update({
        updatedById,
        id,
        data,
      });
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      await this.categoryRepository.delete(id);
      return { message: "Category deleted successfully" };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
