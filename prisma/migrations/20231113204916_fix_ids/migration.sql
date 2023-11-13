/*
  Warnings:

  - You are about to drop the column `address` on the `uploadeds` table. All the data in the column will be lost.
  - Made the column `ownerId` on table `uploadeds` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "uploadeds" DROP COLUMN "address",
ALTER COLUMN "ownerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "uploadeds" ADD CONSTRAINT "uploadeds_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
