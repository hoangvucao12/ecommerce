import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { RolesService } from "./roles.service";
import { HashingService } from "src/shared/services/hashing.service";
import { AuthRepository } from "./auth.repo";
import { RegisterBodyType, SendOtpBodyType } from "./auth.model";

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId();
      const hashedPassword = await this.hashingService.hash(body.password);

      return await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException("Email đã được sử dụng");
        }
      }
      throw new InternalServerErrorException("Đăng ký thất bại");
    }
  }

  async sendOtp(body: SendOtpBodyType) {
    return body;
  }
}
