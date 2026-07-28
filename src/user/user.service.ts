import { ForbiddenException, Injectable } from "@nestjs/common";
import { UserRepository } from "./user.repo";
import {
  CreateUserBodyType,
  GetUserQueryType,
  UpdateUserBodyType,
} from "./user.model";
import { NotFoundRecordException } from "src/shared/error";
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from "src/shared/helpers";
import {
  CannotUpdateOrDeleteYourselfException,
  RoleNotFoundException,
  UserAlreadyExistsException,
} from "./user.error";
import { SharedUserRepository } from "src/shared/repositories/shared-user.repo";
import { RoleName } from "src/shared/constants/role.constant";
import { SharedRoleRepository } from "src/shared/repositories/shared-role.repo";
import { HashingService } from "src/shared/services/hashing.service";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly hashingService: HashingService,
  ) {}

  private async verifyRole({ roleNameAgent, roleIdTarget }) {
    if (roleNameAgent === RoleName.Admin) {
      return true;
    } else {
      const adminRoleId = await this.sharedRoleRepository.getAdminRoleId();
      if (roleIdTarget === adminRoleId) {
        throw new ForbiddenException();
      }
      return true;
    }
  }

  async list(pagination: GetUserQueryType) {
    return await this.userRepository.list(pagination);
  }

  async findById(id: number) {
    const user =
      await this.sharedUserRepository.findUniqueIncludeRolePermission({
        id,
        deletedAt: null,
      });
    if (!user) {
      throw NotFoundRecordException;
    }
    return user;
  }

  async create({
    createdById,
    data,
    createdByRoleName,
  }: {
    createdById: number;
    data: CreateUserBodyType;
    createdByRoleName: string;
  }) {
    try {
      await this.verifyRole({
        roleNameAgent: createdByRoleName,
        roleIdTarget: data.roleId,
      });

      data.password = await this.hashingService.hash(data.password);

      return await this.userRepository.create({ createdById, data });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException;
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException;
      }
      throw error;
    }
  }

  async update({
    updatedById,
    updatedByRoleName,
    id,
    data,
  }: {
    updatedById: number;
    id: number;
    data: UpdateUserBodyType;
    updatedByRoleName: string;
  }) {
    try {
      if (updatedById === id) {
        throw CannotUpdateOrDeleteYourselfException;
      }

      const user = await this.sharedUserRepository.findUnique({
        id,
        deletedAt: null,
      });
      if (!user) {
        throw NotFoundRecordException;
      }

      const roleIdTarget = user.roleId;
      await this.verifyRole({
        roleNameAgent: updatedByRoleName,
        roleIdTarget,
      });

      const updatedUser = await this.sharedUserRepository.update(
        { id, deletedAt: null },
        {
          ...data,
          updatedById,
        },
      );
      return updatedUser;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException;
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException;
      }
      throw error;
    }
  }

  async delete({
    id,
    deletedByRoleName,
    deletedById,
  }: {
    id: number;
    deletedByRoleName: string;
    deletedById: number;
  }) {
    try {
      if (deletedById === id) {
        throw CannotUpdateOrDeleteYourselfException;
      }

      const user = await this.sharedUserRepository.findUnique({
        id,
        deletedAt: null,
      });
      if (!user) {
        throw NotFoundRecordException;
      }

      const roleIdTarget = user.roleId;
      await this.verifyRole({
        roleNameAgent: deletedByRoleName,
        roleIdTarget,
      });

      await this.userRepository.delete(id);
      return {
        message: "User deleted successfully",
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
