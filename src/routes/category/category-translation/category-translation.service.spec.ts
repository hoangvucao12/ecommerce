import { Test, TestingModule } from "@nestjs/testing";
import { CategoryTranslationService } from "./category-translation.service";
import { CategoryTranslationRepository } from "./category-translation.repo";

describe("CategoryTranslationService", () => {
  let service: CategoryTranslationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryTranslationService,
        {
          provide: CategoryTranslationRepository,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CategoryTranslationService>(CategoryTranslationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
