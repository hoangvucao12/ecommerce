import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import {
  CreateRoleBodyType,
  GetRoleDetailResponseType,
  GetRoleQueryType,
  GetRolesResponseType,
  RoleType,
  UpdateRoleBodyType,
} from "./role.model";

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: GetRoleQueryType): Promise<GetRolesResponseType> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({
        where: { deletedAt: null },
      }),
      this.prismaService.role.findMany({
        where: { deletedAt: null },
        skip,
        take,
      }),
    ]);

    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    };
  }

  findById(id: number): Promise<GetRoleDetailResponseType | null> {
    return this.prismaService.role.findUnique({
      where: { id, deletedAt: null },
      include: { permissions: { where: { deletedAt: null } } },
    });
  }

  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateRoleBodyType;
  }): Promise<RoleType> {
    return this.prismaService.role.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  async update({
    updatedById,
    id,
    data,
  }: {
    updatedById: number;
    id: number;
    data: UpdateRoleBodyType;
  }): Promise<RoleType> {
    const { permissionIds, ...rest } = data;

    if (permissionIds.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: { id: { in: permissionIds } },
      });

      const deletedPermissions = permissions.filter(
        (permission) => permission.deletedAt,
      );

      if (deletedPermissions.length > 0) {
        const deletedPermissionIds = deletedPermissions
          .map((permission) => permission.id)
          .join(", ");
        throw new BadRequestException(
          `Cannot update role with deleted permissions: ${deletedPermissionIds}`,
        );
      }
    }

    return this.prismaService.role.update({
      where: { id, deletedAt: null },
      data: {
        ...rest,
        updatedById,
        permissions: permissionIds
          ? { set: permissionIds.map((pid) => ({ id: pid })) }
          : undefined,
      },
      include: { permissions: { where: { deletedAt: null } } },
    });
  }

  delete(id: number): Promise<RoleType> {
    return this.prismaService.role.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
