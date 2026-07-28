import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import {
  CreateUserBodyType,
  GetUserQueryType,
  GetUserResponseType,
  UserType,
} from "./user.model";

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: GetUserQueryType): Promise<GetUserResponseType> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: { deletedAt: null },
      }),
      this.prismaService.user.findMany({
        where: { deletedAt: null },
        skip,
        take,
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
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

  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateUserBodyType;
  }): Promise<UserType> {
    return this.prismaService.user.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  delete(id: number): Promise<UserType> {
    return this.prismaService.user.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
