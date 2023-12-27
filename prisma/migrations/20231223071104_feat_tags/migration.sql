-- AlterTable
ALTER TABLE "canvases" ADD COLUMN     "tags" VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "templates" ADD COLUMN     "tags" VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[];
