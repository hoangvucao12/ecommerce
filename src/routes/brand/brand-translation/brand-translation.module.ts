import { Module } from "@nestjs/common";
import { BrandTranslationService } from "./brand-translation.service";
import { BrandTranslationController } from "./brand-translation.controller";
import { BrandTranslationRepository } from "./brand-translation.repo";

@Module({
  controllers: [BrandTranslationController],
  providers: [BrandTranslationService, BrandTranslationRepository],
  exports: [BrandTranslationService],
})
export class BrandTranslationModule {}
