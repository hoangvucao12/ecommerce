import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./repositories/auth.repository";
import { AuthService } from "./services/auth.service";
import { GoogleAuthService } from "./services/google-auth.service";
import { SessionService } from "./services/session.service";

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, GoogleAuthService, SessionService],
})
export class AuthModule {}
