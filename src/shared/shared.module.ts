import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./services/prisma.service";
import { HashingService } from "./services/hashing.service";

@Global() // Không cần import trong mọi module
@Module({
  providers: [PrismaService, HashingService],
  exports: [PrismaService, HashingService],
})
export class SharedModule {}
