/*
  Warnings:

  - You are about to drop the column `body` on the `scripture` table. All the data in the column will be lost.
  - Added the required column `bodyParas` to the `Scripture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Scripture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `scripture` DROP COLUMN `body`,
    ADD COLUMN `bodyParas` JSON NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `md` CHAR(5) NOT NULL DEFAULT (date_format(`date`,'%m-%d')),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ALTER COLUMN `book` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `idx_scripture_md` ON `Scripture`(`md`);
