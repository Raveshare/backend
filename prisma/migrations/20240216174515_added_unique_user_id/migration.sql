/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `user_funds` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateIndex
CREATE UNIQUE INDEX "user_funds_userId_key" ON "user_funds"("userId");
