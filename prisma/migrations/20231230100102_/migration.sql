-- DropForeignKey
ALTER TABLE "user_published_canvases" DROP CONSTRAINT "user_published_canvases_canvasId_fkey";

-- DropForeignKey
ALTER TABLE "user_published_canvases" DROP CONSTRAINT "user_published_canvases_ownerId_fkey";

-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "user_published_canvases" ALTER COLUMN "canvasId" DROP NOT NULL,
ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_published_canvases" ADD CONSTRAINT "user_published_canvases_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_published_canvases" ADD CONSTRAINT "user_published_canvases_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "canvases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
