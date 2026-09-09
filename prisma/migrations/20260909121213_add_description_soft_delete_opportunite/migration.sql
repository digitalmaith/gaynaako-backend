/*
  Warnings:

  - Added the required column `description` to the `opportunites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "opportunites" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "supprimeLe" TIMESTAMP(3);
