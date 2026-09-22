-- CreateEnum
CREATE TYPE "CycleFacturation" AS ENUM ('MENSUEL', 'ANNUEL');

-- CreateEnum
CREATE TYPE "StatutAbonnement" AS ENUM ('EN_ATTENTE', 'ACTIF', 'EXPIRE', 'ANNULE', 'ECHEC_PAIEMENT');

-- CreateEnum
CREATE TYPE "StatutTransaction" AS ENUM ('EN_ATTENTE', 'REUSSIE', 'ECHOUEE', 'REMBOURSEE');

-- CreateEnum
CREATE TYPE "FournisseurPaiement" AS ENUM ('WAVE', 'ORANGE_MONEY');

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "prixMensuel" INTEGER NOT NULL,
    "prixAnnuel" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "ordreAffichage" INTEGER NOT NULL DEFAULT 0,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_fonctionnalites" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,

    CONSTRAINT "plan_fonctionnalites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonnements" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "cycle" "CycleFacturation" NOT NULL,
    "statut" "StatutAbonnement" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "renouvellementAuto" BOOLEAN NOT NULL DEFAULT true,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supprimeLe" TIMESTAMP(3),

    CONSTRAINT "abonnements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "abonnementId" TEXT NOT NULL,
    "fournisseur" "FournisseurPaiement" NOT NULL,
    "referenceExterne" TEXT,
    "montant" INTEGER NOT NULL,
    "statut" "StatutTransaction" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateConfirmation" TIMESTAMP(3),
    "metadonnees" JSONB,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_nom_key" ON "plans"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "plan_fonctionnalites_planId_cle_key" ON "plan_fonctionnalites"("planId", "cle");

-- CreateIndex
CREATE INDEX "abonnements_utilisateurId_idx" ON "abonnements"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_referenceExterne_key" ON "transactions"("referenceExterne");

-- CreateIndex
CREATE INDEX "transactions_abonnementId_idx" ON "transactions"("abonnementId");

-- AddForeignKey
ALTER TABLE "plan_fonctionnalites" ADD CONSTRAINT "plan_fonctionnalites_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_abonnementId_fkey" FOREIGN KEY ("abonnementId") REFERENCES "abonnements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
