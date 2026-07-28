import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SharedModule } from "./shared/shared.module";
import { AuthModule } from "./routes/auth/auth.module";
import { ZodSerializerInterceptor } from "nestjs-zod";
import { LanguageModule } from "./language/language.module";
import { PermissionModule } from "./permission/permission.module";
import { RoleModule } from "./role/role.module";
import { ProfileModule } from "./profile/profile.module";
import { UserModule } from "./user/user.module";
import CustomZodValidationPipe from "./shared/pipes/custom-zod-validation.pipe";

@Module({
  imports: [
    SharedModule,
    AuthModule,
    LanguageModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
  ],
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
