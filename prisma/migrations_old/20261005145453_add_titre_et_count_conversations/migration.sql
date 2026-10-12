-- Migration corrigée pour compatibilité MariaDB 10.4 / réexécution idempotente.
--
-- Problèmes d'origine :
-- 1. `ADD COLUMN dateMaj DATETIME(3) NOT NULL` sans défaut → échoue si la table
--    contient déjà des lignes (dev), et plante la shadow DB si elle est vide.
-- 2. `CREATE INDEX ... _utilisateurId_idx` fait que MariaDB supprime
--    automatiquement l'index `_utilisateurId_fkey` (même colonne), donc le
--    `DROP INDEX _utilisateurId_fkey` qui suit échoue.
--
-- Chaque opération est rendue conditionnelle pour pouvoir être rejouée sur
-- n'importe quelle base.

-- 1. Colonne `dateMaj` (NOT NULL avec défaut NOW() pour être safe sur table non vide)
SET @exist := (SELECT COUNT(*) FROM information_schema.columns
               WHERE table_schema = DATABASE()
                 AND table_name   = 'chatbot_conversations'
                 AND column_name  = 'dateMaj');
SET @sql := IF(@exist = 0,
  'ALTER TABLE `chatbot_conversations` ADD COLUMN `dateMaj` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Colonne `nombreMessages`
SET @exist := (SELECT COUNT(*) FROM information_schema.columns
               WHERE table_schema = DATABASE()
                 AND table_name   = 'chatbot_conversations'
                 AND column_name  = 'nombreMessages');
SET @sql := IF(@exist = 0,
  'ALTER TABLE `chatbot_conversations` ADD COLUMN `nombreMessages` INTEGER NOT NULL DEFAULT 0',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Colonne `titre`
SET @exist := (SELECT COUNT(*) FROM information_schema.columns
               WHERE table_schema = DATABASE()
                 AND table_name   = 'chatbot_conversations'
                 AND column_name  = 'titre');
SET @sql := IF(@exist = 0,
  'ALTER TABLE `chatbot_conversations` ADD COLUMN `titre` VARCHAR(191) NOT NULL DEFAULT ''Nouvelle conversation''',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Créer l'index `_utilisateurId_idx` (seulement s'il n'existe pas déjà)
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics
               WHERE table_schema = DATABASE()
                 AND table_name   = 'chatbot_conversations'
                 AND index_name   = 'chatbot_conversations_utilisateurId_idx');
SET @sql := IF(@exist = 0,
  'CREATE INDEX `chatbot_conversations_utilisateurId_idx` ON `chatbot_conversations`(`utilisateurId`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. Supprimer l'ancien index `_utilisateurId_fkey` (seulement s'il existe)
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics
               WHERE table_schema = DATABASE()
                 AND table_name   = 'chatbot_conversations'
                 AND index_name   = 'chatbot_conversations_utilisateurId_fkey');
SET @sql := IF(@exist > 0,
  'DROP INDEX `chatbot_conversations_utilisateurId_fkey` ON `chatbot_conversations`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;