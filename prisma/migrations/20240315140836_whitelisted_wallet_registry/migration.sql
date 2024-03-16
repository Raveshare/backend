-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateTable
CREATE TABLE "wallet_whitelisted_registry" (
    "id" SERIAL NOT NULL,
    "wallet" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "wallet_whitelisted_registry_pkey" PRIMARY KEY ("id")
);
