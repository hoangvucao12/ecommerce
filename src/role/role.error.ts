import {
  ForbiddenException,
  UnprocessableEntityException,
} from "@nestjs/common";

export const RoleAlreadyExistsException = new UnprocessableEntityException([
  {
    message: "Error.RoleAlreadyExists",
    field: "name",
  },
]);

export const ProhibitedActionOnBaseRoleException = new ForbiddenException([
  {
    message: "Error.ProhibitedActionOnBaseRole",
    field: "name",
  },
]);
