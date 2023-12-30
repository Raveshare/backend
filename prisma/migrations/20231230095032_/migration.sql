/*
  Warnings:

  - You are about to drop the column `status` on the `user_published_canvases` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "user_published_canvases" DROP COLUMN "status",
ADD COLUMN     "metadata" JSON;

-- AddForeignKey
ALTER TABLE "user_published_canvases" ADD CONSTRAINT "user_published_canvases_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_published_canvases" ADD CONSTRAINT "user_published_canvases_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "canvases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
