import { UnprocessableEntityException } from "@nestjs/common";

export const BrandAlreadyExistsException = new UnprocessableEntityException([
  {
    message: "Error.BrandAlreadyExists",
    field: "name",
  },
]);
