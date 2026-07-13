import { Injectable } from "@nestjs/common";
import { UnprocessableEntityException } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { HashingService } from "src/shared/services/hashing.service";
import { AuthRepository } from "./auth.repo";
import { RegisterBodyType, SendOtpBodyType } from "./auth.model";
import { SharedUserRepository } from "src/shared/repositories/shared-user.repo";
import { isUniqueConstraintPrismaError, generateOtp } from "src/shared/helpers";
import { addMilliseconds } from "date-fns";
import { TypeOfVerificationCode } from "src/shared/constants/auth.constant";
import envConfig from "src/shared/config";
import ms from "ms";
import { EmailService } from "src/shared/services/email.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId();
      const hashedPassword = await this.hashingService.hash(body.password);
      const verificationCode =
        await this.authRepository.findUniqueVerificationCode({
          email: body.email,
          code: body.code,
          type: TypeOfVerificationCode.Register,
        });

      if (!verificationCode) {
        throw new UnprocessableEntityException([
          {
            field: "code",
            message: "Mã OTP không hợp lệ",
          },
        ]);
      }

      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            field: "code",
            message: "Mã OTP đã hết hạn",
          },
        ]);
      }

      return await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new UnprocessableEntityException([
          {
            field: "email",
            message: "Email đã tồn tại",
          },
        ]);
      }
      throw error;
    }
  }

  async sendOtp(body: SendOtpBodyType) {
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    });
    if (user) {
      throw new UnprocessableEntityException([
        {
          field: "email",
          message: "Email đã tồn tại",
        },
      ]);
    }

    const code = generateOtp();
    const verificationCode = await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(
        new Date(),
        ms(
          envConfig.OTP_EXPIRES_IN as `${number}${"ms" | "s" | "m" | "h" | "d"}`,
        ),
      ),
    });
    const emailResponse = await this.emailService.sendOtp({
      email: body.email,
      code,
    });
    if (emailResponse.error) {
      throw new UnprocessableEntityException([
        {
          field: "code",
          message: "Gửi mã OTP thất bại, vui lòng thử lại",
        },
      ]);
    }
    return verificationCode;
  }
}
