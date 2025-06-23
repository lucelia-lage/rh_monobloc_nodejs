-- AlterTable
ALTER TABLE `computer` ADD COLUMN `defectiveAt` DATETIME(3) NULL,
    ADD COLUMN `defectiveReportedBy` VARCHAR(191) NULL,
    ADD COLUMN `isDefective` BOOLEAN NOT NULL DEFAULT false;
