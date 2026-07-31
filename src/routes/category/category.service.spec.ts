import { Test, TestingModule } from "@nestjs/testing";
import { CategoryService } from "./category.service";
import { CategoryRepository } from "./category.repo";
import { I18nService } from "nestjs-i18n";

describe("CategoryService", () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: {},
        },
        {
          provide: I18nService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
