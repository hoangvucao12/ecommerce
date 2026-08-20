import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { UserType } from "../models/shared-user.model";
import { RoleType } from "../models/shared-role.model";
import { PermissionType } from "../models/shared-permission.model";

type UserLookup = ({ email: string } | { id: number }) & {
  deletedAt?: null;
};

type UserIncludeRolePermissionType = UserType & {
  role: RoleType & { permissions: PermissionType[] };
};

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(uniqueObject: UserLookup): Promise<UserType | null> {
    return await this.prismaService.user.findFirst({
      where: { ...uniqueObject, deletedAt: null },
    });
  }

  findUniqueIncludeRolePermission(
    uniqueObject: UserLookup,
  ): Promise<UserIncludeRolePermissionType | null> {
    return this.prismaService.user.findFirst({
      where: { ...uniqueObject, deletedAt: null },
      include: {
        role: {
          include: {
            permissions: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });
  }

  update(
    uniqueObject: { id: number },
    data: Partial<UserType>,
  ): Promise<UserType> {
    return this.prismaService.user.update({
      where: {
        id: uniqueObject.id,
        deletedAt: null,
      },
      data,
    });
  }
}
