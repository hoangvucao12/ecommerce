import { UnprocessableEntityException } from "@nestjs/common";

export const BrandTranslationAlreadyExistsException =
  new UnprocessableEntityException([
    {
      message: "Error.BrandTranslationAlreadyExists",
      field: "name",
    },
  ]);
