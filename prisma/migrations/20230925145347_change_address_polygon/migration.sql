/*
  Warnings:

  - The primary key for the `owners` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `owners` table. All the data in the column will be lost.
  - Added the required column `polygon_address` to the `owners` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable
ALTER TABLE "owners" RENAME COLUMN "address" TO "polygon_address";
