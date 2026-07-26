import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import {
  CreatePermissionBodyType,
  GetPermissionDetailResponseType,
  GetPermissionQueryType,
  GetPermissionResponseType,
  PermissionType,
  UpdatePermissionBodyType,
} from "./permission.model";

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(
    pagination: GetPermissionQueryType,
  ): Promise<GetPermissionResponseType> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where: { deletedAt: null },
      }),
      this.prismaService.permission.findMany({
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

  findById(id: number): Promise<GetPermissionDetailResponseType | null> {
    return this.prismaService.permission.findUnique({
      where: { id, deletedAt: null },
    });
  }

  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreatePermissionBodyType;
  }): Promise<PermissionType> {
    return this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  update({
    updatedById,
    id,
    data,
  }: {
    updatedById: number;
    id: number;
    data: Partial<UpdatePermissionBodyType>;
  }): Promise<PermissionType> {
    return this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
      },
    });
  }

  delete(id: number, idHard?: boolean): Promise<PermissionType> {
    if (idHard) {
      return this.prismaService.permission.delete({
        where: { id },
      });
    }
    return this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
