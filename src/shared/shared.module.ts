import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./services/prisma.service";
import { HashingService } from "./services/hashing.service";
import { SharedUserRepository } from "./repositories/shared-user.repo";
import { EmailService } from "./services/email.service";
import { JwtModule } from "@nestjs/jwt";
import { TokenService } from "./services/token.service";

@Global() // Không cần import trong mọi module
@Module({
  providers: [
    PrismaService,
    HashingService,
    SharedUserRepository,
    EmailService,
    TokenService,
  ],
  exports: [
    PrismaService,
    HashingService,
    SharedUserRepository,
    EmailService,
    TokenService,
  ],
  imports: [JwtModule],
})
export class SharedModule {}
