import { Injectable } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import { NotFoundRecordException } from "src/shared/error";
import {
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from "src/shared/helpers";
import { ProductAlreadyExistsException } from "./product.error";
import {
  CreateProductBodyType,
  GetProductQueryType,
  UpdateProductBodyType,
} from "./product.model";
import { ProductRepository } from "./product.repo";

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  list(query: GetProductQueryType) {
    return this.productRepository.list(
      query,
      I18nContext.current()?.lang ?? "en",
    );
  }

  async findById(id: number) {
    const product = await this.productRepository.findById(
      id,
      I18nContext.current()?.lang ?? "en",
    );
    if (!product) throw NotFoundRecordException;
    return product;
  }

  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateProductBodyType;
  }) {
    try {
      return await this.productRepository.create({ createdById, data });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw ProductAlreadyExistsException;
      }
      throw error;
    }
  }

  async update({
    updatedById,
    productId,
    data,
  }: {
    updatedById: number;
    productId: number;
    data: UpdateProductBodyType;
  }) {
    try {
      return await this.productRepository.update({
        updatedById,
        productId,
        data,
      });
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      if (isUniqueConstraintPrismaError(error)) {
        throw ProductAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      await this.productRepository.delete(id);
      return { message: "Product deleted successfully" };
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException;
      throw error;
    }
  }
}
