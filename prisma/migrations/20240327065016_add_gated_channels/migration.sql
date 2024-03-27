-- AlterTable
ALTER TABLE "frames" ALTER COLUMN "gatedChannels" DROP NOT NULL,
ALTER COLUMN "gatedChannels" DROP DEFAULT,
ALTER COLUMN "gatedChannels" SET DATA TYPE TEXT,
ALTER COLUMN "gatedCollections" DROP NOT NULL,
ALTER COLUMN "gatedCollections" DROP DEFAULT,
ALTER COLUMN "gatedCollections" SET DATA TYPE TEXT;
