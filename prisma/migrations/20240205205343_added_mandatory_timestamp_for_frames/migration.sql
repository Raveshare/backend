/*
  Warnings:

  - Made the column `createdAt` on table `frames` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `frames` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "frames" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];
