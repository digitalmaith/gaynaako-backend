-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_tokenHash_key`(`tokenHash`),
    INDEX `refresh_tokens_utilisateurId_idx`(`utilisateurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pending_registrations` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `role` ENUM('ENTREPRENEUR', 'PME', 'ONG', 'ADMINISTRATEUR') NOT NULL,
    `donneesProfil` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pending_registrations_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_verifications` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `purpose` ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET') NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `consumed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `otp_verifications_email_purpose_idx`(`email`, `purpose`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilisateurs` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `role` ENUM('ENTREPRENEUR', 'PME', 'ONG', 'ADMINISTRATEUR') NOT NULL,
    `statut` ENUM('EN_ATTENTE', 'ACTIF', 'SUSPENDU') NOT NULL DEFAULT 'ACTIF',
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `supprimeLe` DATETIME(3) NULL,

    UNIQUE INDEX `utilisateurs_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entrepreneur_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `secteurId` VARCHAR(191) NOT NULL,
    `paysId` VARCHAR(191) NOT NULL,
    `domaineExpertise` VARCHAR(191) NOT NULL,
    `objectifs` TEXT NULL,

    UNIQUE INDEX `entrepreneur_profiles_utilisateurId_key`(`utilisateurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pme_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `nomEntreprise` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NULL,

    UNIQUE INDEX `pme_profiles_utilisateurId_key`(`utilisateurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ong_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `nomOrganisation` VARCHAR(191) NOT NULL,
    `mission` TEXT NULL,
    `logoUrl` VARCHAR(191) NULL,

    UNIQUE INDEX `ong_profiles_utilisateurId_key`(`utilisateurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `administrateur_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `niveauAcces` VARCHAR(191) NOT NULL DEFAULT 'STANDARD',

    UNIQUE INDEX `administrateur_profiles_utilisateurId_key`(`utilisateurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `secteurs` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `secteurs_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pays` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,

    UNIQUE INDEX `pays_nom_key`(`nom`),
    UNIQUE INDEX `pays_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `domaines_intervention` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `domaines_intervention_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emetteurs` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `type` ENUM('SITE_WEB', 'API', 'RESEAU_SOCIAL', 'PORTAIL_INSTITUTIONNEL') NOT NULL,
    `frequenceCollecte` VARCHAR(191) NOT NULL,
    `dernierScan` DATETIME(3) NULL,
    `statut` ENUM('ACTIF', 'INACTIF') NOT NULL DEFAULT 'ACTIF',
    `administrateurId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opportunites` (
    `id` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NULL,
    `titre` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `type` ENUM('FINANCEMENT', 'SUBVENTION', 'APPEL_OFFRE', 'CONCOURS', 'PROGRAMME_ACCELERATION') NOT NULL,
    `pays` VARCHAR(191) NOT NULL,
    `dateLimite` DATETIME(3) NOT NULL,
    `criteresEligibilite` TEXT NULL,
    `origine` ENUM('MANUELLE', 'IA') NOT NULL DEFAULT 'MANUELLE',
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `supprimeLe` DATETIME(3) NULL,
    `secteurId` VARCHAR(191) NOT NULL,
    `emetteurId` VARCHAR(191) NULL,
    `administrateurId` VARCHAR(191) NULL,

    UNIQUE INDEX `opportunites_externalId_key`(`externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `candidatures` (
    `id` VARCHAR(191) NOT NULL,
    `statut` ENUM('BROUILLON', 'SOUMISE', 'EN_COURS', 'ACCEPTEE', 'REJETEE') NOT NULL DEFAULT 'BROUILLON',
    `dateSoumission` DATETIME(3) NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `utilisateurId` VARCHAR(191) NOT NULL,
    `opportuniteId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `candidatures_utilisateurId_opportuniteId_key`(`utilisateurId`, `opportuniteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favoris` (
    `id` VARCHAR(191) NOT NULL,
    `dateAjout` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `utilisateurId` VARCHAR(191) NOT NULL,
    `opportuniteId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `favoris_utilisateurId_opportuniteId_key`(`utilisateurId`, `opportuniteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommandations` (
    `id` VARCHAR(191) NOT NULL,
    `scorePertinence` DOUBLE NOT NULL,
    `dateGeneration` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `utilisateurId` VARCHAR(191) NOT NULL,
    `opportuniteId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatbot_conversations` (
    `id` VARCHAR(191) NOT NULL,
    `dateDebut` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `utilisateurId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_messages` (
    `id` VARCHAR(191) NOT NULL,
    `contenu` TEXT NOT NULL,
    `expediteur` ENUM('UTILISATEUR', 'BOT') NOT NULL,
    `horodatage` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `conversationId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `canal` ENUM('EMAIL', 'WHATSAPP') NOT NULL,
    `contenu` TEXT NOT NULL,
    `dateEnvoi` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `envoyee` BOOLEAN NOT NULL DEFAULT false,
    `utilisateurId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journaux_activite` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `dateHeure` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `administrateurId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents_utilisateur` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `type` ENUM('CV', 'PIECE_IDENTITE', 'REGISTRE_COMMERCE', 'NINEA', 'STATUTS_ENTREPRISE', 'ATTESTATION_FISCALE', 'ATTESTATION_SOCIALE', 'JUSTIFICATIF_DOMICILE', 'ATTESTATION', 'AUTRE') NOT NULL,
    `libelle` VARCHAR(191) NOT NULL,
    `publicId` VARCHAR(191) NOT NULL,
    `resourceType` VARCHAR(191) NOT NULL,
    `nomFichier` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `tailleOctets` INTEGER NOT NULL,
    `dateExpiration` DATETIME(3) NULL,
    `dateAjout` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `documents_utilisateur_utilisateurId_idx`(`utilisateurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plans` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `prixMensuel` INTEGER NOT NULL,
    `prixAnnuel` INTEGER NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `ordreAffichage` INTEGER NOT NULL DEFAULT 0,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `plans_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_fonctionnalites` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `cle` VARCHAR(191) NOT NULL,
    `valeur` VARCHAR(191) NOT NULL,

    INDEX `plan_fonctionnalites_planId_idx`(`planId`),
    UNIQUE INDEX `plan_fonctionnalites_planId_cle_key`(`planId`, `cle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `abonnements` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `cycle` ENUM('MENSUEL', 'ANNUEL') NOT NULL,
    `statut` ENUM('EN_ATTENTE', 'ACTIF', 'EXPIRE', 'ANNULE', 'ECHEC_PAIEMENT') NOT NULL DEFAULT 'EN_ATTENTE',
    `dateDebut` DATETIME(3) NULL,
    `dateFin` DATETIME(3) NULL,
    `renouvellementAuto` BOOLEAN NOT NULL DEFAULT true,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `supprimeLe` DATETIME(3) NULL,

    INDEX `abonnements_utilisateurId_idx`(`utilisateurId`),
    INDEX `abonnements_planId_idx`(`planId`),
    INDEX `abonnements_statut_idx`(`statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `abonnementId` VARCHAR(191) NOT NULL,
    `fournisseur` ENUM('WAVE', 'ORANGE_MONEY') NOT NULL,
    `referenceExterne` VARCHAR(191) NULL,
    `montant` INTEGER NOT NULL,
    `statut` ENUM('EN_ATTENTE', 'REUSSIE', 'ECHOUEE', 'REMBOURSEE') NOT NULL DEFAULT 'EN_ATTENTE',
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateConfirmation` DATETIME(3) NULL,
    `metadonnees` JSON NULL,

    UNIQUE INDEX `transactions_referenceExterne_key`(`referenceExterne`),
    INDEX `transactions_abonnementId_idx`(`abonnementId`),
    INDEX `transactions_statut_idx`(`statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PmeProfileToSecteur` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PmeProfileToSecteur_AB_unique`(`A`, `B`),
    INDEX `_PmeProfileToSecteur_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DomaineInterventionToOngProfile` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DomaineInterventionToOngProfile_AB_unique`(`A`, `B`),
    INDEX `_DomaineInterventionToOngProfile_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entrepreneur_profiles` ADD CONSTRAINT `entrepreneur_profiles_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entrepreneur_profiles` ADD CONSTRAINT `entrepreneur_profiles_secteurId_fkey` FOREIGN KEY (`secteurId`) REFERENCES `secteurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entrepreneur_profiles` ADD CONSTRAINT `entrepreneur_profiles_paysId_fkey` FOREIGN KEY (`paysId`) REFERENCES `pays`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pme_profiles` ADD CONSTRAINT `pme_profiles_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ong_profiles` ADD CONSTRAINT `ong_profiles_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `administrateur_profiles` ADD CONSTRAINT `administrateur_profiles_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emetteurs` ADD CONSTRAINT `emetteurs_administrateurId_fkey` FOREIGN KEY (`administrateurId`) REFERENCES `administrateur_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opportunites` ADD CONSTRAINT `opportunites_secteurId_fkey` FOREIGN KEY (`secteurId`) REFERENCES `secteurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opportunites` ADD CONSTRAINT `opportunites_emetteurId_fkey` FOREIGN KEY (`emetteurId`) REFERENCES `emetteurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opportunites` ADD CONSTRAINT `opportunites_administrateurId_fkey` FOREIGN KEY (`administrateurId`) REFERENCES `administrateur_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidatures` ADD CONSTRAINT `candidatures_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidatures` ADD CONSTRAINT `candidatures_opportuniteId_fkey` FOREIGN KEY (`opportuniteId`) REFERENCES `opportunites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoris` ADD CONSTRAINT `favoris_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoris` ADD CONSTRAINT `favoris_opportuniteId_fkey` FOREIGN KEY (`opportuniteId`) REFERENCES `opportunites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommandations` ADD CONSTRAINT `recommandations_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommandations` ADD CONSTRAINT `recommandations_opportuniteId_fkey` FOREIGN KEY (`opportuniteId`) REFERENCES `opportunites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatbot_conversations` ADD CONSTRAINT `chatbot_conversations_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `chatbot_conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journaux_activite` ADD CONSTRAINT `journaux_activite_administrateurId_fkey` FOREIGN KEY (`administrateurId`) REFERENCES `administrateur_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents_utilisateur` ADD CONSTRAINT `documents_utilisateur_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan_fonctionnalites` ADD CONSTRAINT `plan_fonctionnalites_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `abonnements` ADD CONSTRAINT `abonnements_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `abonnements` ADD CONSTRAINT `abonnements_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_abonnementId_fkey` FOREIGN KEY (`abonnementId`) REFERENCES `abonnements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PmeProfileToSecteur` ADD CONSTRAINT `_PmeProfileToSecteur_A_fkey` FOREIGN KEY (`A`) REFERENCES `pme_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PmeProfileToSecteur` ADD CONSTRAINT `_PmeProfileToSecteur_B_fkey` FOREIGN KEY (`B`) REFERENCES `secteurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DomaineInterventionToOngProfile` ADD CONSTRAINT `_DomaineInterventionToOngProfile_A_fkey` FOREIGN KEY (`A`) REFERENCES `domaines_intervention`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DomaineInterventionToOngProfile` ADD CONSTRAINT `_DomaineInterventionToOngProfile_B_fkey` FOREIGN KEY (`B`) REFERENCES `ong_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
