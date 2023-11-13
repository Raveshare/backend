/*
  Warnings:

  - Made the column `ownerId` on table `canvases` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "canvases" DROP CONSTRAINT "canvases_ownerId_fkey";

-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "ownerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "canvases" ADD CONSTRAINT "canvases_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
