-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "groupId" VARCHAR(255),
ADD COLUMN     "taskIdInGroup" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];
