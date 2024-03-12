-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "frames" ALTER COLUMN "chainId" DROP DEFAULT,
ALTER COLUMN "contract_address" DROP DEFAULT;

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];
