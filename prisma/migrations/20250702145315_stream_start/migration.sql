-- CreateTable
CREATE TABLE `house` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wall` VARCHAR(10) NULL,
    `roof` VARCHAR(10) NULL,
    `style` VARCHAR(10) NULL,
    `used` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NOT NULL,
    `token` VARCHAR(100) NULL,
    `refresh` VARCHAR(100) NULL,
    `expires` VARCHAR(50) NULL,
    `client_id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(20) NULL,

    UNIQUE INDEX `name`(`name`),
    UNIQUE INDEX `client_id`(`client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriber` (
    `id` INTEGER NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `start_date` VARCHAR(50) NOT NULL,
    `tier` INTEGER NOT NULL,
    `gifted` BOOLEAN NOT NULL,
    `gifted_by_id` INTEGER NULL,
    `gifted_by_name` VARCHAR(191) NULL,
    `resub_date` VARCHAR(50) NULL,

    UNIQUE INDEX `subscriber_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
