/*
  Warnings:

  - You are about to drop the column `firstName` on the `pending_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `pending_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `pending_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `organizationName` on the `pending_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `pending_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `pending_registrations` table. All the data in the column will be lost.
  - You are about to drop the `otp_verifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `donneesProfil` to the `pending_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motDePasse` to the `pending_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otpCode` to the `pending_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otpExpiration` to the `pending_registrations` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `pending_registrations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('ENTREPRENEUR', 'PME', 'ONG', 'ADMINISTRATEUR');

-- CreateEnum
CREATE TYPE "StatutUtilisateur" AS ENUM ('EN_ATTENTE', 'ACTIF', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "TypeOpportunite" AS ENUM ('FINANCEMENT', 'SUBVENTION', 'APPEL_OFFRE', 'CONCOURS', 'PROGRAMME_ACCELERATION');

-- CreateEnum
CREATE TYPE "StatutCandidature" AS ENUM ('BROUILLON', 'SOUMISE', 'EN_COURS', 'ACCEPTEE', 'REJETEE');

-- CreateEnum
CREATE TYPE "TypeEmetteur" AS ENUM ('SITE_WEB', 'API', 'RESEAU_SOCIAL', 'PORTAIL_INSTITUTIONNEL');

-- CreateEnum
CREATE TYPE "StatutEmetteur" AS ENUM ('ACTIF', 'INACTIF');

-- CreateEnum
CREATE TYPE "CanalNotification" AS ENUM ('EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "Expediteur" AS ENUM ('UTILISATEUR', 'BOT');

-- AlterTable
ALTER TABLE "pending_registrations" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "logoUrl",
DROP COLUMN "organizationName",
DROP COLUMN "passwordHash",
DROP COLUMN "updatedAt",
ADD COLUMN     "donneesProfil" JSONB NOT NULL,
ADD COLUMN     "motDePasse" TEXT NOT NULL,
ADD COLUMN     "otpCode" TEXT NOT NULL,
ADD COLUMN     "otpExpiration" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "RoleUtilisateur" NOT NULL;

-- DropTable
DROP TABLE "otp_verifications";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "OtpPurpose";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" "RoleUtilisateur" NOT NULL,
    "statut" "StatutUtilisateur" NOT NULL DEFAULT 'ACTIF',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrepreneur_profiles" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "secteurActivite" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "domaineExpertise" TEXT NOT NULL,
    "objectifs" TEXT,

    CONSTRAINT "entrepreneur_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pme_profiles" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "nomEntreprise" TEXT NOT NULL,
    "secteursActivite" TEXT[],

    CONSTRAINT "pme_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ong_profiles" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "nomOrganisation" TEXT NOT NULL,
    "domainesIntervention" TEXT[],
    "mission" TEXT,

    CONSTRAINT "ong_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administrateur_profiles" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "niveauAcces" TEXT NOT NULL DEFAULT 'STANDARD',

    CONSTRAINT "administrateur_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secteurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "secteurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emetteurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "TypeEmetteur" NOT NULL,
    "frequenceCollecte" TEXT NOT NULL,
    "dernierScan" TIMESTAMP(3),
    "statut" "StatutEmetteur" NOT NULL DEFAULT 'ACTIF',
    "administrateurId" TEXT NOT NULL,

    CONSTRAINT "emetteurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunites" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "type" "TypeOpportunite" NOT NULL,
    "pays" TEXT NOT NULL,
    "dateLimite" TIMESTAMP(3) NOT NULL,
    "criteresEligibilite" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "secteurId" TEXT NOT NULL,
    "emetteurId" TEXT,
    "administrateurId" TEXT,

    CONSTRAINT "opportunites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidatures" (
    "id" TEXT NOT NULL,
    "statut" "StatutCandidature" NOT NULL DEFAULT 'BROUILLON',
    "dateSoumission" TIMESTAMP(3),
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateurId" TEXT NOT NULL,
    "opportuniteId" TEXT NOT NULL,

    CONSTRAINT "candidatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoris" (
    "id" TEXT NOT NULL,
    "dateAjout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateurId" TEXT NOT NULL,
    "opportuniteId" TEXT NOT NULL,

    CONSTRAINT "favoris_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommandations" (
    "id" TEXT NOT NULL,
    "scorePertinence" DOUBLE PRECISION NOT NULL,
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateurId" TEXT NOT NULL,
    "opportuniteId" TEXT NOT NULL,

    CONSTRAINT "recommandations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_conversations" (
    "id" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateurId" TEXT NOT NULL,

    CONSTRAINT "chatbot_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "expediteur" "Expediteur" NOT NULL,
    "horodatage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT NOT NULL,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "canal" "CanalNotification" NOT NULL,
    "contenu" TEXT NOT NULL,
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "envoyee" BOOLEAN NOT NULL DEFAULT false,
    "utilisateurId" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journaux_activite" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "dateHeure" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "administrateurId" TEXT NOT NULL,

    CONSTRAINT "journaux_activite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "entrepreneur_profiles_utilisateurId_key" ON "entrepreneur_profiles"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "pme_profiles_utilisateurId_key" ON "pme_profiles"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "ong_profiles_utilisateurId_key" ON "ong_profiles"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "administrateur_profiles_utilisateurId_key" ON "administrateur_profiles"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "secteurs_nom_key" ON "secteurs"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "candidatures_utilisateurId_opportuniteId_key" ON "candidatures"("utilisateurId", "opportuniteId");

-- CreateIndex
CREATE UNIQUE INDEX "favoris_utilisateurId_opportuniteId_key" ON "favoris"("utilisateurId", "opportuniteId");

-- AddForeignKey
ALTER TABLE "entrepreneur_profiles" ADD CONSTRAINT "entrepreneur_profiles_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pme_profiles" ADD CONSTRAINT "pme_profiles_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ong_profiles" ADD CONSTRAINT "ong_profiles_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrateur_profiles" ADD CONSTRAINT "administrateur_profiles_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emetteurs" ADD CONSTRAINT "emetteurs_administrateurId_fkey" FOREIGN KEY ("administrateurId") REFERENCES "administrateur_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunites" ADD CONSTRAINT "opportunites_secteurId_fkey" FOREIGN KEY ("secteurId") REFERENCES "secteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunites" ADD CONSTRAINT "opportunites_emetteurId_fkey" FOREIGN KEY ("emetteurId") REFERENCES "emetteurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunites" ADD CONSTRAINT "opportunites_administrateurId_fkey" FOREIGN KEY ("administrateurId") REFERENCES "administrateur_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_opportuniteId_fkey" FOREIGN KEY ("opportuniteId") REFERENCES "opportunites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_opportuniteId_fkey" FOREIGN KEY ("opportuniteId") REFERENCES "opportunites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommandations" ADD CONSTRAINT "recommandations_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommandations" ADD CONSTRAINT "recommandations_opportuniteId_fkey" FOREIGN KEY ("opportuniteId") REFERENCES "opportunites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_conversations" ADD CONSTRAINT "chatbot_conversations_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "chatbot_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journaux_activite" ADD CONSTRAINT "journaux_activite_administrateurId_fkey" FOREIGN KEY ("administrateurId") REFERENCES "administrateur_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
