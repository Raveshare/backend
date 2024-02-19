/*
  Warnings:

  - You are about to drop the column `contract_address` on the `frames` table. All the data in the column will be lost.
  - Made the column `owner` on table `frames` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "frames" DROP COLUMN "contract_address",
ALTER COLUMN "owner" SET NOT NULL;

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AddForeignKey
ALTER TABLE "frames" ADD CONSTRAINT "frames_owner_fkey" FOREIGN KEY ("owner") REFERENCES "owners"("evm_address") ON DELETE RESTRICT ON UPDATE CASCADE;
