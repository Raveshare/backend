/*
  Warnings:

  - The primary key for the `owners` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `polygon_address` on the `owners` table. All the data in the column will be lost.
  - Added the required column `address` to the `owners` table without a default value. This is not possible if the table is not empty.

*/


ALTER TABLE "owners" 
RENAME COLUMN "polygon_address" TO "address";
