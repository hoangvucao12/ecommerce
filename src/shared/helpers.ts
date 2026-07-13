import { Prisma } from "@prisma/client";
import { randomInt } from "crypto";

export function isUniqueConstraintPrismaError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError & { code: "P2002" } {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export function isNotFoundPrismaError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError & { code: "P2025" } {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

export const generateOtp = () => {
  return randomInt(100000, 999999).toString();
};
