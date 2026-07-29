import { Injectable } from "@nestjs/common";
import {
  NotFoundRecordException,
  InvalidPasswordException,
} from "src/shared/error";
import { SharedUserRepository } from "src/shared/repositories/shared-user.repo";
import { HashingService } from "src/shared/services/hashing.service";
import { ChangePasswordBodyType, UpdateMeBodyType } from "./profile.model";
import { isNotFoundPrismaError } from "src/shared/helpers";

@Injectable()
export class ProfileService {
  constructor(
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async getProfile(userId: number) {
    const user =
      await this.sharedUserRepository.findUniqueIncludeRolePermission({
        id: userId,
        deletedAt: null,
      });
    if (!user) {
      throw NotFoundRecordException;
    }
    return user;
  }

  async updateProfile(userId: number, data: UpdateMeBodyType) {
    try {
      return await this.sharedUserRepository.update(
        { id: userId },
        {
          ...data,
          updatedById: userId,
        },
      );
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  async changePassword({
    userId,
    body,
  }: {
    userId: number;
    body: Omit<ChangePasswordBodyType, "confirmNewPassword">;
  }) {
    try {
      const user = await this.sharedUserRepository.findUnique({
        id: userId,
        deletedAt: null,
      });
      if (!user) {
        throw NotFoundRecordException;
      }
      const isPasswordMatch = await this.hashingService.compare(
        body.password,
        user.password,
      );
      if (!isPasswordMatch) {
        throw InvalidPasswordException;
      }
      const hashedNewPassword = await this.hashingService.hash(
        body.newPassword,
      );
      await this.sharedUserRepository.update(
        { id: userId },
        {
          password: hashedNewPassword,
          updatedById: userId,
        },
      );
      return { message: "Password changed successfully" };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
