/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `owners` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "owners" ADD COLUMN     "username" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "owners_username_key" ON "owners"("username");
