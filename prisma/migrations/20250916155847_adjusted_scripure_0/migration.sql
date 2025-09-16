/*
  Warnings:

  - You are about to drop the column `bodyParas` on the `scripture` table. All the data in the column will be lost.
  - Added the required column `body` to the `Scripture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `scripture` DROP COLUMN `bodyParas`,
    ADD COLUMN `body` JSON NOT NULL,
    MODIFY `md` CHAR(5) NOT NULL DEFAULT (date_format(`date`,'%m-%d'));
