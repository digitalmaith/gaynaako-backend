/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `opportunites` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrigineOpportunite" AS ENUM ('MANUELLE', 'IA');

-- AlterTable
ALTER TABLE "opportunites" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "origine" "OrigineOpportunite" NOT NULL DEFAULT 'MANUELLE';

-- CreateIndex
CREATE UNIQUE INDEX "opportunites_externalId_key" ON "opportunites"("externalId");
