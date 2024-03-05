/*
  Warnings:

  - Added the required column `hash` to the `shared_mint_canvas` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `chain` on the `shared_mint_canvas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "shared_mint_canvas" ADD COLUMN     "hash" VARCHAR(255) NOT NULL,
DROP COLUMN "chain",
ADD COLUMN     "chain" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];
