/*
  Warnings:

  - You are about to drop the column `url` on the `documents_utilisateur` table. All the data in the column will be lost.
  - Added the required column `publicId` to the `documents_utilisateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resourceType` to the `documents_utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "documents_utilisateur" DROP COLUMN "url",
ADD COLUMN     "publicId" TEXT NOT NULL,
ADD COLUMN     "resourceType" TEXT NOT NULL;
