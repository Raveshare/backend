/*
  Warnings:

  - You are about to drop the `Assets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Assets";

-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "tags" VARCHAR(255)[],
    "type" VARCHAR(255),
    "author" VARCHAR(255),
    "image" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "dimensions" INTEGER[],
    "campaign" VARCHAR(255),
    "featured" BOOLEAN DEFAULT false,
    "wallet" VARCHAR(255),

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);
