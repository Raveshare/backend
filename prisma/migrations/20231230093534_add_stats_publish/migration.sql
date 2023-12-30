-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateTable
CREATE TABLE "user_published_canvases" (
    "id" SERIAL NOT NULL,
    "canvasId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "platform" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" TIMESTAMPTZ(6),
    "txHash" VARCHAR(255),
    "status" VARCHAR(255),

    CONSTRAINT "user_published_canvases_pkey" PRIMARY KEY ("id")
);
