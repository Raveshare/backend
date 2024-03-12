-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "shared_mint_canvas" ALTER COLUMN "contractType" DROP DEFAULT;

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];
