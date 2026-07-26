import { Injectable } from "@nestjs/common";
import { PermissionRepository } from "./permission.repo";
import {
  CreatePermissionBodyType,
  GetPermissionQueryType,
  UpdatePermissionBodyType,
} from "./permission.model";
import { NotFoundRecordException } from "src/shared/error";
import {
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from "src/shared/helpers";
import { PermissionAlreadyExistsException } from "./permission.error";

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async list(pagination: GetPermissionQueryType) {
    return await this.permissionRepository.list(pagination);
  }

  async findById(id: number) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw NotFoundRecordException;
    }
    return permission;
  }

  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreatePermissionBodyType;
  }) {
    try {
      return await this.permissionRepository.create({ createdById, data });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException;
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
    data: UpdatePermissionBodyType;
  }) {
    try {
      const permission = await this.permissionRepository.update({
        updatedById,
        id,
        data,
      });
      return permission;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      await this.permissionRepository.delete(id);
      return {
        message: "Permission deleted successfully",
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
