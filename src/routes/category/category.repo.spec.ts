import { CategoryRepository } from "./category.repo";
import { PrismaService } from "src/shared/services/prisma.service";

describe("CategoryRepository", () => {
  it("includes translations when creating a category", async () => {
    const createMock = jest.fn().mockResolvedValue({
      id: 1,
      name: "Test",
      logo: null,
      parentCategoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdById: 1,
      updatedById: null,
      categoryTranslations: [],
    });

    const prismaService = {
      category: {
        create: createMock,
      },
    } as unknown as PrismaService;

    const repository = new CategoryRepository(prismaService);

    await repository.create({
      createdById: 1,
      data: {
        name: "Test",
        logo: null,
        parentCategoryId: null,
      },
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Test",
          createdById: 1,
        }),
        include: {
          categoryTranslations: {
            where: { deletedAt: null },
          },
        },
      }),
    );
  });
});
