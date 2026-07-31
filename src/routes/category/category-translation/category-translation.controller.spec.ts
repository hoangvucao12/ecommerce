import { Test, TestingModule } from "@nestjs/testing";
import { CategoryTranslationController } from "./category-translation.controller";
import { CategoryTranslationService } from "./category-translation.service";

describe("CategoryTranslationController", () => {
  let controller: CategoryTranslationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryTranslationController],
      providers: [
        {
          provide: CategoryTranslationService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CategoryTranslationController>(CategoryTranslationController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
