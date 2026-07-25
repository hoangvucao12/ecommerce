import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SharedModule } from "./shared/shared.module";
import { AuthModule } from "./routes/auth/auth.module";
import { UsersModule } from "./routes/users/users.module";
import { ZodSerializerInterceptor } from "nestjs-zod";
import { LanguageModule } from "./language/language.module";
import CustomZodValidationPipe from "./shared/pipes/custom-zod-validation.pipe";

@Module({
  imports: [SharedModule, AuthModule, UsersModule, LanguageModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: "APP_PIPE",
      useClass: CustomZodValidationPipe,
    },
    {
      provide: "APP_INTERCEPTOR",
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
