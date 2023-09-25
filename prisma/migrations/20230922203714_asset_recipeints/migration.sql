-- AlterTable
ALTER TABLE "canvases" ADD COLUMN     "assetsRecipientElementData" JSONB,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "owners" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
