import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./services/prisma.service";
import { HashingService } from "./services/hashing.service";
import { SharedUserRepository } from "./repositories/shared-user.repo";
import { EmailService } from "./services/email.service";
import { JwtModule } from "@nestjs/jwt";
import { TokenService } from "./services/token.service";
import { AccessTokenGuard } from "./guards/access-token.guard";
import { ApiKeyGuard } from "./guards/api-key.guard";
import { AuthenticationGuard } from "./guards/authentication.guard";
import { APP_GUARD } from "@nestjs/core";
import { TwoFactorAuthService } from "./services/2FA.service";
import { SharedRoleRepository } from "./repositories/shared-role.repo";
import { S3Service } from "./services/S3.service";

@Global() // Không cần import trong mọi module
@Module({
  providers: [
    PrismaService,
    HashingService,
    SharedUserRepository,
    EmailService,
    TokenService,
    AccessTokenGuard,
    ApiKeyGuard,
    TwoFactorAuthService,
    SharedRoleRepository,
    S3Service,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [
    PrismaService,
    HashingService,
    SharedUserRepository,
    EmailService,
    TokenService,
    TwoFactorAuthService,
    SharedRoleRepository,
    S3Service,
  ],
  imports: [JwtModule],
})
export class SharedModule {}
