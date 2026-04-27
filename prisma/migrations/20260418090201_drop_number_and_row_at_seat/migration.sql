/*
  Warnings:

  - You are about to drop the column `number` on the `Seat` table. All the data in the column will be lost.
  - You are about to drop the column `row` on the `Seat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "number",
DROP COLUMN "row";
