/*
  Warnings:

  - The values [PENDING_CONFIRMATION] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Language` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `code` on the `Language` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Language` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `VarChar(10)`.
  - You are about to drop the column `base_price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `virtual_price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `ProductSKUSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ProductSKUSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `SKU` table. All the data in the column will be lost.
  - You are about to drop the `Variant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SKUToVariantOption` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,skuId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderId,productId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,type]` on the table `VerificationCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Brand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiver` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basePrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variants` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `virtualPrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdById` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `image` to the `ProductSKUSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productTranslations` to the `ProductSKUSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `ProductSKUSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skuPrice` to the `ProductSKUSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `SKU` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdById` on table `SKU` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING_PAYMENT', 'PENDING_PICKUP', 'PENDING_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VerificationCodeType" ADD VALUE 'LOGIN';
ALTER TYPE "VerificationCodeType" ADD VALUE 'DISABLE_2FA';

-- DropForeignKey
ALTER TABLE "BrandTranslation" DROP CONSTRAINT "BrandTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_skuId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryTranslation" DROP CONSTRAINT "CategoryTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ProductTranslation" DROP CONSTRAINT "ProductTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "SKU" DROP CONSTRAINT "SKU_createdById_fkey";

-- DropForeignKey
ALTER TABLE "UserTranslation" DROP CONSTRAINT "UserTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_productId_fkey";

-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "VariantOption" DROP CONSTRAINT "VariantOption_createdById_fkey";

-- DropForeignKey
ALTER TABLE "VariantOption" DROP CONSTRAINT "VariantOption_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "VariantOption" DROP CONSTRAINT "VariantOption_variantId_fkey";

-- DropForeignKey
ALTER TABLE "_SKUToVariantOption" DROP CONSTRAINT "_SKUToVariantOption_A_fkey";

-- DropForeignKey
ALTER TABLE "_SKUToVariantOption" DROP CONSTRAINT "_SKUToVariantOption_B_fkey";

-- DropIndex
DROP INDEX "Language_code_key";

-- DropIndex
DROP INDEX "Role_name_key";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_totpSecret_key";

-- DropIndex
DROP INDEX "VerificationCode_email_code_type_idx";

-- DropIndex
DROP INDEX "VerificationCode_email_key";

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "deletedById" INTEGER,
ADD COLUMN     "name" VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE "BrandTranslation" ADD COLUMN     "deletedById" INTEGER,
ALTER COLUMN "languageId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "deletedById" INTEGER,
ADD COLUMN     "logo" VARCHAR(1000),
ADD COLUMN     "name" VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE "CategoryTranslation" ADD COLUMN     "deletedById" INTEGER,
ALTER COLUMN "languageId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Language" DROP CONSTRAINT "Language_pkey",
DROP COLUMN "code",
ADD COLUMN     "deletedById" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(10),
ADD CONSTRAINT "Language_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Language_id_seq";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deletedById" INTEGER,
ADD COLUMN     "paymentId" INTEGER NOT NULL,
ADD COLUMN     "receiver" JSONB NOT NULL,
ADD COLUMN     "shopId" INTEGER;

-- AlterTable
ALTER TABLE "PaymentTransaction" ALTER COLUMN "accountNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "deletedById" INTEGER,
ADD COLUMN     "module" VARCHAR(500) NOT NULL DEFAULT '',
ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "base_price",
DROP COLUMN "virtual_price",
ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "deletedById" INTEGER,
ADD COLUMN     "name" VARCHAR(500) NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "variants" JSONB NOT NULL,
ADD COLUMN     "virtualPrice" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductSKUSnapshot" DROP COLUMN "images",
DROP COLUMN "price",
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "productId" INTEGER,
ADD COLUMN     "productTranslations" JSONB NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "skuPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "ProductTranslation" ADD COLUMN     "deletedById" INTEGER,
ALTER COLUMN "languageId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "deviceId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD COLUMN     "updateCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "deletedById" INTEGER,
ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "SKU" DROP COLUMN "images",
ADD COLUMN     "deletedById" INTEGER,
ADD COLUMN     "image" TEXT NOT NULL,
ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "UserTranslation" ADD COLUMN     "deletedById" INTEGER,
ALTER COLUMN "languageId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Variant";

-- DropTable
DROP TABLE "VariantOption";

-- DropTable
DROP TABLE "_SKUToVariantOption";

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userAgent" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "lastActive" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Websocket" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Websocket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewMedia" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "type" "MediaType" NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrderToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OrderToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OrderToProduct_B_index" ON "_OrderToProduct"("B");

-- CreateIndex
CREATE INDEX "Brand_deletedAt_idx" ON "Brand"("deletedAt");

-- CreateIndex
CREATE INDEX "BrandTranslation_deletedAt_idx" ON "BrandTranslation"("deletedAt");

-- CreateIndex
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_skuId_key" ON "CartItem"("userId", "skuId");

-- CreateIndex
CREATE INDEX "Category_deletedAt_idx" ON "Category"("deletedAt");

-- CreateIndex
CREATE INDEX "CategoryTranslation_deletedAt_idx" ON "CategoryTranslation"("deletedAt");

-- CreateIndex
CREATE INDEX "Language_deletedAt_idx" ON "Language"("deletedAt");

-- CreateIndex
CREATE INDEX "Order_deletedAt_idx" ON "Order"("deletedAt");

-- CreateIndex
CREATE INDEX "Order_status_deletedAt_idx" ON "Order"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "Permission_deletedAt_idx" ON "Permission"("deletedAt");

-- CreateIndex
CREATE INDEX "Product_deletedAt_idx" ON "Product"("deletedAt");

-- CreateIndex
CREATE INDEX "ProductTranslation_deletedAt_idx" ON "ProductTranslation"("deletedAt");

-- CreateIndex
CREATE INDEX "ProductTranslation_productId_idx" ON "ProductTranslation"("productId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_productId_key" ON "Review"("orderId", "productId");

-- CreateIndex
CREATE INDEX "Role_deletedAt_idx" ON "Role"("deletedAt");

-- CreateIndex
CREATE INDEX "SKU_deletedAt_idx" ON "SKU"("deletedAt");

-- CreateIndex
CREATE INDEX "SKU_productId_idx" ON "SKU"("productId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "UserTranslation_deletedAt_idx" ON "UserTranslation"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationCode_email_type_key" ON "VerificationCode"("email", "type");

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTranslation" ADD CONSTRAINT "UserTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTranslation" ADD CONSTRAINT "UserTranslation_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BrandTranslation" ADD CONSTRAINT "BrandTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BrandTranslation" ADD CONSTRAINT "BrandTranslation_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "SKU"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductSKUSnapshot" ADD CONSTRAINT "ProductSKUSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Websocket" ADD CONSTRAINT "Websocket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ReviewMedia" ADD CONSTRAINT "ReviewMedia_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_OrderToProduct" ADD CONSTRAINT "_OrderToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToProduct" ADD CONSTRAINT "_OrderToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
