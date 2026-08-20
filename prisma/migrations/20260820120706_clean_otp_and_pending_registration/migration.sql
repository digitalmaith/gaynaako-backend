/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `entrepreneur_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `otpCode` on the `pending_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiration` on the `pending_registrations` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `pending_registrations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "entrepreneur_profiles" DROP COLUMN "logoUrl";

-- AlterTable
ALTER TABLE "pending_registrations" DROP COLUMN "otpCode",
DROP COLUMN "otpExpiration",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otp_verifications_email_purpose_idx" ON "otp_verifications"("email", "purpose");
