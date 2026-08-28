/*
  Warnings:

  - You are about to drop the column `pays` on the `entrepreneur_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `secteurActivite` on the `entrepreneur_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `domainesIntervention` on the `ong_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `secteursActivite` on the `pme_profiles` table. All the data in the column will be lost.
  - Added the required column `paysId` to the `entrepreneur_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secteurId` to the `entrepreneur_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "entrepreneur_profiles" DROP COLUMN "pays",
DROP COLUMN "secteurActivite",
ADD COLUMN     "paysId" TEXT NOT NULL,
ADD COLUMN     "secteurId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ong_profiles" DROP COLUMN "domainesIntervention";

-- AlterTable
ALTER TABLE "pme_profiles" DROP COLUMN "secteursActivite";

-- CreateTable
CREATE TABLE "pays" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "pays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domaines_intervention" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "domaines_intervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PmeProfileToSecteur" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PmeProfileToSecteur_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DomaineInterventionToOngProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DomaineInterventionToOngProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "pays_nom_key" ON "pays"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "pays_code_key" ON "pays"("code");

-- CreateIndex
CREATE UNIQUE INDEX "domaines_intervention_nom_key" ON "domaines_intervention"("nom");

-- CreateIndex
CREATE INDEX "_PmeProfileToSecteur_B_index" ON "_PmeProfileToSecteur"("B");

-- CreateIndex
CREATE INDEX "_DomaineInterventionToOngProfile_B_index" ON "_DomaineInterventionToOngProfile"("B");

-- AddForeignKey
ALTER TABLE "entrepreneur_profiles" ADD CONSTRAINT "entrepreneur_profiles_secteurId_fkey" FOREIGN KEY ("secteurId") REFERENCES "secteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrepreneur_profiles" ADD CONSTRAINT "entrepreneur_profiles_paysId_fkey" FOREIGN KEY ("paysId") REFERENCES "pays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PmeProfileToSecteur" ADD CONSTRAINT "_PmeProfileToSecteur_A_fkey" FOREIGN KEY ("A") REFERENCES "pme_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PmeProfileToSecteur" ADD CONSTRAINT "_PmeProfileToSecteur_B_fkey" FOREIGN KEY ("B") REFERENCES "secteurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomaineInterventionToOngProfile" ADD CONSTRAINT "_DomaineInterventionToOngProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "domaines_intervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomaineInterventionToOngProfile" ADD CONSTRAINT "_DomaineInterventionToOngProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "ong_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
