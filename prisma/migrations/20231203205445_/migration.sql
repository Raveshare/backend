/*
  Warnings:

  - You are about to drop the column `taskId` on the `points` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "points" DROP CONSTRAINT "points_taskId_fkey";

-- AlterTable
ALTER TABLE "points" DROP COLUMN "taskId";

-- CreateTable
CREATE TABLE "points_history" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "taskId" INTEGER,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "points_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
