import { Injectable } from "@nestjs/common";
import { RoleRepository } from "./role.repo";
import {
  CreateRoleBodyType,
  GetRoleQueryType,
  UpdateRoleBodyType,
} from "./role.model";
import { NotFoundRecordException } from "src/shared/error";
import {
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from "src/shared/helpers";
import {
  ProhibitedActionOnBaseRoleException,
  RoleAlreadyExistsException,
} from "./role.error";
import { RoleName } from "src/shared/constants/role.constant";

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async list(pagination: GetRoleQueryType) {
    return await this.roleRepository.list(pagination);
  }

  async findById(id: number) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw NotFoundRecordException;
    }
    return role;
  }

  async create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateRoleBodyType;
  }) {
    try {
      return await this.roleRepository.create({ createdById, data });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException;
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
    data: UpdateRoleBodyType;
  }) {
    try {
      const role = await this.roleRepository.findById(id);
      if (!role) {
        throw NotFoundRecordException;
      }

      if (RoleName.Admin === role.name) {
        throw ProhibitedActionOnBaseRoleException;
      }

      const updatedRole = await this.roleRepository.update({
        updatedById,
        id,
        data,
      });
      return updatedRole;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const role = await this.roleRepository.findById(id);
      if (!role) {
        throw NotFoundRecordException;
      }
      const baseRoles: string[] = [
        RoleName.Admin,
        RoleName.User,
        RoleName.Seller,
      ];
      if (baseRoles.includes(role.name)) {
        throw ProhibitedActionOnBaseRoleException;
      }

      await this.roleRepository.delete(id);
      return {
        message: "Role deleted successfully",
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
