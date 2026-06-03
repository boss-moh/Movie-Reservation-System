/*
  Warnings:

  - The `status` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `Seat` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[seatId,showtimeId]` on the table `ReservedSeat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `showtimeId` to the `ReservedSeat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED');

-- DropIndex
DROP INDEX "ReservedSeat_reservationId_seatId_key";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "status",
ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "ReservedSeat" ADD COLUMN     "showtimeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "type",
ADD COLUMN     "type" "SeatType" NOT NULL DEFAULT 'STANDARD';

-- CreateIndex
CREATE INDEX "ReservedSeat_showtimeId_idx" ON "ReservedSeat"("showtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "ReservedSeat_seatId_showtimeId_key" ON "ReservedSeat"("seatId", "showtimeId");

-- AddForeignKey
ALTER TABLE "ReservedSeat" ADD CONSTRAINT "ReservedSeat_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
