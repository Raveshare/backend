/*
  Warnings:

  - You are about to drop the column `minterAddress` on the `frames` table. All the data in the column will be lost.
  - You are about to drop the column `txHash` on the `frames` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `shared_canvas` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "frames_txHash_key";

-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "frames" DROP COLUMN "minterAddress",
DROP COLUMN "txHash",
ADD COLUMN     "minters" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateIndex
CREATE UNIQUE INDEX "shared_canvas_slug_key" ON "shared_canvas"("slug");
