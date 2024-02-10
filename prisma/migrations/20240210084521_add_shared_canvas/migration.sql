-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateTable
CREATE TABLE "shared_canvas" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "canvasId" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_canvas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shared_canvas" ADD CONSTRAINT "shared_canvas_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "canvases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
