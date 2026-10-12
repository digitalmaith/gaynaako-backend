-- 1. La FK doit partir avant de changer le type de l'id référencé
ALTER TABLE `recommandations` DROP FOREIGN KEY `recommandations_opportunityProcessedId_fkey`;

-- 2. opportunities_processed : ancien id conservé + nouvel id en 36 caractères
ALTER TABLE `opportunities_processed`
  ADD COLUMN `old_id` VARCHAR(12) NULL,
  MODIFY `id` VARCHAR(36) NOT NULL;

-- 3. recommandations : la cible suit le nouveau type et reste obligatoire
ALTER TABLE `recommandations`
  MODIFY `opportunityProcessedId` VARCHAR(36) NOT NULL;

-- 4. Remettre la FK
ALTER TABLE `recommandations`
  ADD CONSTRAINT `recommandations_opportunityProcessedId_fkey`
  FOREIGN KEY (`opportunityProcessedId`) REFERENCES `opportunities_processed`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Nouvelle table des sources de scraping
CREATE TABLE `sources_scraping` (
    `id` VARCHAR(36) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `type` ENUM('html', 'puppeteer', 'api') NOT NULL DEFAULT 'html',
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `selectors` JSON NULL,
    `pagination` JSON NULL,
    `rate_limit_ms` INTEGER NOT NULL DEFAULT 3000,
    `api_config` JSON NULL,
    `dernier_scan` DATETIME(3) NULL,
    `dernier_statut` VARCHAR(50) NULL,
    `dernier_message` TEXT NULL,
    `nb_opportunites` INTEGER NOT NULL DEFAULT 0,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_maj` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `idx_sources_actif`(`actif`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;