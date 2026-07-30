import { Test, TestingModule } from '@nestjs/testing';
import { BrandTranslationController } from './brand-translation.controller';
import { BrandTranslationService } from './brand-translation.service';

describe('BrandTranslationController', () => {
  let controller: BrandTranslationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandTranslationController],
      providers: [BrandTranslationService],
    }).compile();

    controller = module.get<BrandTranslationController>(BrandTranslationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
