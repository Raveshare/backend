/*
  Warnings:

  - You are about to alter the column `imageURL` on the `nftData` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(510)`.

*/
-- AlterTable
ALTER TABLE "nftData" ALTER COLUMN "openseaLink" SET DATA TYPE VARCHAR(510),
ALTER COLUMN "imageURL" SET DATA TYPE VARCHAR(510);
