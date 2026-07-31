import { Injectable } from "@nestjs/common";
import { BrandRepository } from "./brand.repo";
import {
  CreateBrandBodyType,
  GetBrandQueryType,
  UpdateBrandBodyType,
} from "./brand.model";
import { NotFoundRecordException } from "src/shared/error";
import {
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from "src/shared/helpers";
import { BrandAlreadyExistsException } from "./brand.error";
import { I18nContext, I18nService, I18nTranslation } from "nestjs-i18n";

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly i18n: I18nService<I18nTranslation>,
  ) {}

  async list(pagination: GetBrandQueryType) {
    return await this.brandRepository.list(
      pagination,
      I18nContext.current()?.lang as string,
    );
  }

  async findById(id: number) {
    const brand = await this.brandRepository.findById(
      id,
      I18nContext.current()?.lang as string,
    );
    if (!brand) {
      throw NotFoundRecordException;
    }
    return brand;
  }

  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateBrandBodyType;
  }) {
    try {
      return await this.brandRepository.create({ createdById, data });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw BrandAlreadyExistsException;
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
    data: UpdateBrandBodyType;
  }) {
    try {
      return await this.brandRepository.update({
        updatedById,
        id,
        data,
      });
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw BrandAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      await this.brandRepository.delete(id);
      return { message: "Brand deleted successfully" };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
