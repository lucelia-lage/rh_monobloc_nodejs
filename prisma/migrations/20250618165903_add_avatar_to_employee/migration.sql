/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Computer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `employee` ADD COLUMN `avatar` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatar` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Computer_userId_key` ON `Computer`(`userId`);
