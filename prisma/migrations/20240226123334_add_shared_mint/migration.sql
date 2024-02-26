-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "frames" ADD COLUMN     "redirectLink" VARCHAR(255);

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateTable
CREATE TABLE "shared_mint_canvas" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "canvasId" INTEGER NOT NULL,
    "contract" VARCHAR(255) NOT NULL,
    "chain" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_mint_canvas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shared_mint_canvas_slug_key" ON "shared_mint_canvas"("slug");

-- AddForeignKey
ALTER TABLE "shared_mint_canvas" ADD CONSTRAINT "shared_mint_canvas_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "canvases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
