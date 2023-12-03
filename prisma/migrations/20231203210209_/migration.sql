/*
  Warnings:

  - You are about to drop the column `canvasOwned` on the `owners` table. All the data in the column will be lost.
  - You are about to drop the column `nftOwned` on the `owners` table. All the data in the column will be lost.
  - You are about to drop the `auths` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `points` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "points" DROP CONSTRAINT "points_ownerId_fkey";

-- AlterTable
ALTER TABLE "owners" DROP COLUMN "canvasOwned",
DROP COLUMN "nftOwned",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "auths";

-- DropTable
DROP TABLE "points";

-- CreateTable
CREATE TABLE "socials" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "lens_auth_token" JSONB,
    "lens_handle" VARCHAR(255),
    "followNftAddress" VARCHAR(255),
    "profileId" VARCHAR(255),
    "farcaster" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "socials_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "socials" ADD CONSTRAINT "socials_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
