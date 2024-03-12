-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "shared_mint_canvas" ADD COLUMN     "contractType" VARCHAR(255) NOT NULL DEFAULT 'ERC721';

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];
