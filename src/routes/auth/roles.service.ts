import { Injectable } from "@nestjs/common";
import { RoleName } from "src/shared/constants/role.constant";
import { PrismaService } from "src/shared/services/prisma.service";

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null;

  constructor(private readonly prismaService: PrismaService) {}

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }

    const role: { id: number } = await this.prismaService.$queryRaw`  
    SELECT id FROM "Role" WHERE name = ${RoleName.User} AND "deletedAt" IS NULL lIMIT 1`;

    // const role = await this.prismaService.role.findUniqueOrThrow({
    //   where: {
    //     name: RoleName.User,
    //   },
    // });

    this.clientRoleId = role.id;
    return this.clientRoleId;
  }
}
