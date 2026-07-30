import { Test, TestingModule } from '@nestjs/testing';
import { BrandTranslationService } from './brand-translation.service';

describe('BrandTranslationService', () => {
  let service: BrandTranslationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrandTranslationService],
    }).compile();

    service = module.get<BrandTranslationService>(BrandTranslationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
