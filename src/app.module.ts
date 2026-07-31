import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SharedModule } from "./shared/shared.module";
import { AuthModule } from "./routes/auth/auth.module";
import { ZodSerializerInterceptor } from "nestjs-zod";
import { LanguageModule } from "./routes/language/language.module";
import { PermissionModule } from "./routes/permission/permission.module";
import { RoleModule } from "./routes/role/role.module";
import { ProfileModule } from "./routes/profile/profile.module";
import { UserModule } from "./routes/user/user.module";
import { MediaModule } from "./routes/media/media.module";
import { BrandModule } from "./routes/brand/brand.module";
import { BrandTranslationModule } from "./routes/brand/brand-translation/brand-translation.module";
import CustomZodValidationPipe from "./shared/pipes/custom-zod-validation.pipe";
import { AcceptLanguageResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import * as path from "path";
import { AllLanguageResolver } from "./shared/resolvers/all-language.resolver";
import { CategoryModule } from "./routes/category/category.module";
import { CategoryTranslationModule } from "./routes/category/category-translation/category-translation.module";

@Module({
  imports: [
    SharedModule,
    AuthModule,
    LanguageModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    MediaModule,
    BrandModule,
    BrandTranslationModule,
    CategoryModule,
    CategoryTranslationModule,

    I18nModule.forRoot({
      fallbackLanguage: "en",
      loaderOptions: {
        path: path.resolve("src/i18n/"),
        watch: true,
      },
      typesOutputPath: path.resolve("src/i18n/generated/i18n.generated.ts"),
      resolvers: [
        {
          use: QueryResolver,
          options: ["lang"],
        },
        AllLanguageResolver,
        AcceptLanguageResolver,
      ],
    }),
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
