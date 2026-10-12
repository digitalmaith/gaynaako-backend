-- Colonnes de suivi des notifications email sur les recommandations
ALTER TABLE `recommandations`
  ADD COLUMN `notifiee` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `date_notification` DATETIME(3) NULL;

CREATE INDEX `idx_reco_notifiee` ON `recommandations`(`notifiee`, `date_notification`);