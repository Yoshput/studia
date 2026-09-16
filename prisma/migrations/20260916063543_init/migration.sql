-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semester` (
    `id` VARCHAR(191) NOT NULL,
    `nama_semester` VARCHAR(191) NOT NULL,
    `tahun_ajaran` VARCHAR(191) NOT NULL,
    `ipk` DOUBLE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matkul` (
    `id` VARCHAR(191) NOT NULL,
    `semester_id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NULL,
    `dosen` VARCHAR(191) NOT NULL,
    `sks` INTEGER NOT NULL,
    `hari` VARCHAR(191) NOT NULL,
    `jam_mulai` VARCHAR(191) NOT NULL,
    `jam_selesai` VARCHAR(191) NOT NULL,
    `ruang` VARCHAR(191) NOT NULL,
    `warna` VARCHAR(191) NULL DEFAULT '#007AFF',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progress_harian` (
    `id` VARCHAR(191) NOT NULL,
    `matkul_id` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `materi_dipelajari` VARCHAR(191) NOT NULL,
    `catatan` TEXT NULL,
    `tingkat_pemahaman` INTEGER NOT NULL DEFAULT 3,
    `lampiran_url` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai_bobot` (
    `id` VARCHAR(191) NOT NULL,
    `matkul_id` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `bobot_persen` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `nilai_bobot_matkul_id_kategori_key`(`matkul_id`, `kategori`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai` (
    `id` VARCHAR(191) NOT NULL,
    `matkul_id` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `nama_item` VARCHAR(191) NOT NULL,
    `nilai` DOUBLE NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tugas_deadline` (
    `id` VARCHAR(191) NOT NULL,
    `matkul_id` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `deadline` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'belum',
    `prioritas` VARCHAR(191) NOT NULL DEFAULT 'sedang',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `matkul` ADD CONSTRAINT `matkul_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progress_harian` ADD CONSTRAINT `progress_harian_matkul_id_fkey` FOREIGN KEY (`matkul_id`) REFERENCES `matkul`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_bobot` ADD CONSTRAINT `nilai_bobot_matkul_id_fkey` FOREIGN KEY (`matkul_id`) REFERENCES `matkul`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai` ADD CONSTRAINT `nilai_matkul_id_fkey` FOREIGN KEY (`matkul_id`) REFERENCES `matkul`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tugas_deadline` ADD CONSTRAINT `tugas_deadline_matkul_id_fkey` FOREIGN KEY (`matkul_id`) REFERENCES `matkul`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
