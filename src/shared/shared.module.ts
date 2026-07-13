import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./services/prisma.service";
import { HashingService } from "./services/hashing.service";
import { SharedUserRepository } from "./repositories/shared-user.repo";
import { EmailService } from "./services/email.service";

@Global() // Không cần import trong mọi module
@Module({
  providers: [
    PrismaService,
    HashingService,
    SharedUserRepository,
    EmailService,
  ],
  exports: [PrismaService, HashingService, SharedUserRepository, EmailService],
})
export class SharedModule {}
