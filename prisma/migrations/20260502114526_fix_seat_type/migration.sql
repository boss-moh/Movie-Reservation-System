/*
  Warnings:

  - The `type` column on the `Seat` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "type",
ADD COLUMN     "type" "SeatType" NOT NULL DEFAULT 'STANDARD';
