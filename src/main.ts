import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import { NestExpressApplication } from "@nestjs/platform-express";
import envConfig from "./shared/config";
// import { UPLOAD_DIR } from "./shared/constants/other.constant";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: [envConfig.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  });
  // app.useStaticAssets(UPLOAD_DIR, {
  //   prefix: "/media/static",
  // });
  app.use(cookieParser());
  await app.listen(envConfig.PORT);
}
void bootstrap();
