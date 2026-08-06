import { UnprocessableEntityException } from "@nestjs/common";

export const ProductAlreadyExistsException = new UnprocessableEntityException([
  { message: "Error.ProductAlreadyExists", field: "name" },
]);
