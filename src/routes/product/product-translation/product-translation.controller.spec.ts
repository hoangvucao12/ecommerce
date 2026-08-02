import { Test, TestingModule } from '@nestjs/testing';
import { ProductTranslationController } from './product-translation.controller';
import { ProductTranslationService } from './product-translation.service';

describe('ProductTranslationController', () => {
  let controller: ProductTranslationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductTranslationController],
      providers: [ProductTranslationService],
    }).compile();

    controller = module.get<ProductTranslationController>(ProductTranslationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
