import { Prisma } from "@prisma/client";
import { randomInt, randomUUID } from "crypto";
import * as path from "path";

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

export function isForeignKeyConstraintPrismaError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError & { code: "P2003" } {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  );
}

export const generateOtp = () => {
  return randomInt(100000, 999999).toString();
};

export const generateRandomFileName = (fileName: string) => {
  const ext = path.extname(fileName);
  return `${randomUUID()}${ext}`;
};
