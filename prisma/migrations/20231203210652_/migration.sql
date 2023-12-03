/*
  Warnings:

  - You are about to drop the column `description` on the `points_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "points_history" DROP COLUMN "description",
ADD COLUMN     "reason" VARCHAR(255);
