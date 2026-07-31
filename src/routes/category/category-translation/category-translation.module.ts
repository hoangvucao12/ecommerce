import { Module } from "@nestjs/common";
import { CategoryTranslationService } from "./category-translation.service";
import { CategoryTranslationController } from "./category-translation.controller";
import { CategoryTranslationRepository } from "./category-translation.repo";

@Module({
  controllers: [CategoryTranslationController],
  providers: [CategoryTranslationService, CategoryTranslationRepository],
  exports: [CategoryTranslationService],
})
export class CategoryTranslationModule {}
