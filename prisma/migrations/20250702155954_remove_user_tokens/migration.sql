/*
  Warnings:

  - You are about to drop the column `expires` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `refresh` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `expires`,
    DROP COLUMN `refresh`;
