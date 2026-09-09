/*
  Warnings:

  - Added the required column `nom` to the `pending_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prenom` to the `pending_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom` to the `utilisateurs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prenom` to the `utilisateurs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pending_registrations" ADD COLUMN     "nom" TEXT NOT NULL,
ADD COLUMN     "prenom" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "nom" TEXT NOT NULL,
ADD COLUMN     "prenom" TEXT NOT NULL;
