-- AlterTable
ALTER TABLE `scripture` MODIFY `md` CHAR(5) NOT NULL DEFAULT (date_format(`date`,'%m-%d'));

-- CreateTable
CREATE TABLE `Collection` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Collection_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `idx_scripture_book` ON `Scripture`(`book`);

-- AddForeignKey
ALTER TABLE `Scripture` ADD CONSTRAINT `Scripture_book_fkey` FOREIGN KEY (`book`) REFERENCES `Collection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
