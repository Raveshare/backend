/*
  Warnings:

  - You are about to drop the column `sponsoredMint` on the `frames` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "frames" DROP COLUMN "sponsoredMint";

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "user_funds" ADD COLUMN     "sponsored" INTEGER NOT NULL DEFAULT 10;
