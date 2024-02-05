-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateTable
CREATE TABLE "frames" (
    "id" SERIAL NOT NULL,
    "frameId" INTEGER NOT NULL,
    "imageUrl" VARCHAR(255) NOT NULL,
    "tokenUri" VARCHAR(255) NOT NULL,
    "minterAddress" VARCHAR(255) NOT NULL,
    "txHash" VARCHAR(255) NOT NULL,
    "isLike" BOOLEAN NOT NULL DEFAULT false,
    "isRecast" BOOLEAN NOT NULL DEFAULT false,
    "isFollow" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "frames_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "frames_txHash_key" ON "frames"("txHash");
