/*
  Warnings:

  - You are about to drop the column `address` on the `owners` table. All the data in the column will be lost.
  - Made the column `ownerId` on table `nftData` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "nftData" DROP CONSTRAINT "nftData_ownerId_fkey";

-- DropIndex
DROP INDEX "owners_address_key";

-- AlterTable
ALTER TABLE "nftData" ALTER COLUMN "permaLink" SET DATA TYPE VARCHAR(510),
ALTER COLUMN "ownerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "owners" DROP COLUMN "address";

-- AddForeignKey
ALTER TABLE "nftData" ADD CONSTRAINT "nftData_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
