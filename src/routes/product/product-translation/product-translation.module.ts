import { Module } from "@nestjs/common";
import { ProductTranslationService } from "./product-translation.service";
import { ProductTranslationController } from "./product-translation.controller";
import { ProductTranslationRepository } from "./product-translation.repo";

@Module({
  controllers: [ProductTranslationController],
  providers: [ProductTranslationService, ProductTranslationRepository],
  exports: [ProductTranslationService],
})
export class ProductTranslationModule {}
