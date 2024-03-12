/*
  Warnings:

  - You are about to drop the column `chain` on the `shared_mint_canvas` table. All the data in the column will be lost.
  - Added the required column `chainId` to the `shared_mint_canvas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "frames" ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT 8453,
ADD COLUMN     "contract_address" VARCHAR(255) NOT NULL DEFAULT '0x769C1417485ad9d74FbB27F4be47890Fd00A96ad';

-- AlterTable
ALTER TABLE "shared_mint_canvas" DROP COLUMN "chain",
ADD COLUMN     "chainId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];
