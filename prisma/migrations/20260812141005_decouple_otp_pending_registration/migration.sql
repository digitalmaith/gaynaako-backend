/*
  Warnings:

  - You are about to drop the column `userId` on the `otp_verifications` table. All the data in the column will be lost.
  - Added the required column `email` to the `otp_verifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "otp_verifications" DROP CONSTRAINT "otp_verifications_userId_fkey";

-- DropIndex
DROP INDEX "otp_verifications_userId_purpose_idx";

-- AlterTable
ALTER TABLE "otp_verifications" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "isEmailVerified" SET DEFAULT true;

-- CreateTable
CREATE TABLE "pending_registrations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "organizationName" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_registrations_email_key" ON "pending_registrations"("email");

-- CreateIndex
CREATE INDEX "otp_verifications_email_purpose_idx" ON "otp_verifications"("email", "purpose");
