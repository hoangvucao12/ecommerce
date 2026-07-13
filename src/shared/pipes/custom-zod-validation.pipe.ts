import { UnprocessableEntityException } from "@nestjs/common";
import { createZodValidationPipe } from "nestjs-zod";
import { ZodError, ZodIssue } from "zod";

const CustomZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: ZodError) => {
    console.log();
    return new UnprocessableEntityException(
      error.issues.map((issue: ZodIssue) => {
        return {
          ...issue,
          path: issue.path.join("."),
        };
      }),
    );
  },
});

export default CustomZodValidationPipe;
