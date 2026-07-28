import { Injectable } from "@nestjs/common";
import { RoleName } from "src/shared/constants/role.constant";
import { PrismaService } from "src/shared/services/prisma.service";
import { RoleType } from "../models/shared-role.model";

@Injectable()
export class SharedRoleRepository {
  private clientRoleId: number | null = null;
  private adminRoleId: number | null = null;

  constructor(private readonly prismaService: PrismaService) {}

  private async getRole(roleName: string) {
    const role: RoleType = await this.prismaService.$queryRaw<RoleType[]>`  
    SELECT id FROM "Role" WHERE name = ${roleName} AND "deletedAt" IS NULL lIMIT 1`.then(
      (res: RoleType[]) => {
        if (res.length === 0) {
          throw new Error(`Role with name ${roleName} not found`);
        }
        return res[0];
      },
    );
    return role;
  }

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }
    const role = await this.getRole(RoleName.User);
    this.clientRoleId = role.id;
    return this.clientRoleId;
  }

  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.adminRoleId;
    }
    const role = await this.getRole(RoleName.Admin);
    this.adminRoleId = role.id;
    return this.adminRoleId;
  }
}
