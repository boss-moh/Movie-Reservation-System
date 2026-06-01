import { prisma } from "@/libs/prisma/config";
import CustomError from "@/errors/CustomError";
import { CreateSeatDTO, UpdateSeatDTO } from "./type";

export const createSeat = async (data: CreateSeatDTO) => {
  const { hallId, type } = data;

  // Check if hall exists
  const oldHallInforamtion = await prisma.hall.findUnique({
    where: { id: hallId },
  });
  if (!oldHallInforamtion) {
    throw new CustomError({ message: "Hall not found", statusCode: 404 });
  }

  const result = prisma.$transaction(async () => {
    await prisma.hall.update({
      where: { id: hallId },
      data: {
        seatsNumber: oldHallInforamtion.seatsNumber + 1,
      },
    });
    const seat = await prisma.seat.create({
      data: {
        hallId,
        ...(type ? { type } : {}),
      },
    });

    return seat;
  });

  return result;
};

export const getAllSeats = async () => {
  const seats = await prisma.seat.findMany({
    where: { isDeleted: false },
  });
  return seats;
};

export const getSeatById = async (seatId: string) => {
  const seat = await prisma.seat.findUnique({
    where: { id: seatId },
  });

  if (!seat) {
    throw new CustomError({ message: "Seat not found", statusCode: 404 });
  }

  return seat;
};

export const getSeatsByHallId = async (hallId: string) => {
  // Check if hall exists
  const hall = await prisma.hall.findUnique({ where: { id: hallId } });
  if (!hall) {
    throw new CustomError({ message: "Hall not found", statusCode: 404 });
  }

  const seats = await prisma.seat.findMany({
    where: {
      hallId,
      isDeleted: false,
    },
  });

  return seats;
};

export const updateSeat = async (seatId: string, data: UpdateSeatDTO) => {
  const seat = await prisma.seat.findUnique({ where: { id: seatId } });

  if (!seat) {
    throw new CustomError({ message: "Seat not found", statusCode: 404 });
  }

  const { type } = data;

  const updatedSeat = await prisma.seat.update({
    where: { id: seatId },
    data: {
      ...(type ? { type } : {}),
    },
  });

  return updatedSeat;
};

export const deleteSeat = async (seatId: string) => {
  const seat = await prisma.seat.findUnique({ where: { id: seatId } });

  if (!seat) {
    throw new CustomError({ message: "Seat not found", statusCode: 404 });
  }

  if (seat.isDeleted) {
    throw new CustomError({ message: "Seat not found", statusCode: 404 });
  }

  await prisma.seat.update({
    where: { id: seatId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return { message: "Seat deleted successfully" };
};

export const restoreSeat = async (seatId: string) => {
  const seat = await prisma.seat.findUnique({ where: { id: seatId } });

  if (!seat) {
    throw new CustomError({ message: "Seat not found", statusCode: 404 });
  }

  await prisma.seat.update({
    where: { id: seatId },
    data: { isDeleted: false, deletedAt: null },
  });

  return { message: "Seat restored successfully" };
};
