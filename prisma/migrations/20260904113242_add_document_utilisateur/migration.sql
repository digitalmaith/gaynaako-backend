-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('CV', 'PIECE_IDENTITE', 'STATUTS_ENTREPRISE', 'JUSTIFICATIF_DOMICILE', 'ATTESTATION', 'AUTRE');

-- CreateTable
CREATE TABLE "documents_utilisateur" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "type" "TypeDocument" NOT NULL,
    "libelle" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nomFichier" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tailleOctets" INTEGER NOT NULL,
    "dateAjout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_utilisateur_utilisateurId_idx" ON "documents_utilisateur"("utilisateurId");

-- AddForeignKey
ALTER TABLE "documents_utilisateur" ADD CONSTRAINT "documents_utilisateur_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
