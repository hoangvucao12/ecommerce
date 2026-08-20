import { Injectable } from "@nestjs/common";
import { RoleName } from "src/shared/constants/role.constant";
import { PrismaService } from "src/shared/services/prisma.service";

@Injectable()
export class SharedRoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private async getRole(roleName: string) {
    const role = await this.prismaService.role.findFirst({
      where: { name: roleName, deletedAt: null, isActive: true },
      select: { id: true },
    });
    if (!role) {
      throw new Error(`Active role with name ${roleName} not found`);
    }
    return role;
  }

  async getClientRoleId() {
    const role = await this.getRole(RoleName.User);
    return role.id;
  }

  async getAdminRoleId() {
    const role = await this.getRole(RoleName.Admin);
    return role.id;
  }
}
