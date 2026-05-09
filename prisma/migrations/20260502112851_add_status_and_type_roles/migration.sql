/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Hall` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `Hall` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `Seat` table. All the data in the column will be lost.
  - You are about to drop the column `row` on the `Seat` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'MAINTENANCE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "SeatType" AS ENUM ('STANDARD', 'VIP');

-- AlterTable
ALTER TABLE "Hall" DROP COLUMN "deletedAt",
DROP COLUMN "isDeleted",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "number",
DROP COLUMN "row";
