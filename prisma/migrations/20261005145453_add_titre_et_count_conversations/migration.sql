/*
  Warnings:

  - Added the required column `dateMaj` to the `chatbot_conversations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chatbot_conversations` ADD COLUMN `dateMaj` DATETIME(3) NOT NULL,
    ADD COLUMN `nombreMessages` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `titre` VARCHAR(191) NOT NULL DEFAULT 'Nouvelle conversation';

-- RedefineIndex
CREATE INDEX `chatbot_conversations_utilisateurId_idx` ON `chatbot_conversations`(`utilisateurId`);
DROP INDEX `chatbot_conversations_utilisateurId_fkey` ON `chatbot_conversations`;
