import { prisma } from "@/libs/prisma/config";
import {
  createNotExitError,
  createForbiddenError,
  CustomError,
} from "@/errors";
import { CreateReservationDTO, ReservationWithDetails } from "./type";
import { ReservationStatus } from "@generated/prisma/enums";

export const createReservation = async (
  data: CreateReservationDTO,
  userId: string,
): Promise<ReservationWithDetails> => {
  const { showtimeId, seatIds } = data;

  if (!seatIds || seatIds.length === 0) {
    throw new CustomError({
      message: "At least one seat must be selected",
      statusCode: 400,
    });
  }

  const uniqueSeatIds = Array.from(new Set(seatIds));
  if (uniqueSeatIds.length !== seatIds.length) {
    throw new CustomError({
      message: "Duplicate seat IDs are not allowed",
      statusCode: 400,
    });
  }

  const showtime = await prisma.showtime.findUnique({
    where: { id: showtimeId, isDeleted: false },
    include: {
      movie: true,
      hall: true,
    },
  });

  if (!showtime) {
    throw new CustomError({
      message: "showtime is not found or deleted",
      statusCode: 404,
    });
  }

  const seats = await prisma.seat.findMany({
    where: {
      id: { in: uniqueSeatIds },
      hallId: showtime.hallId,
      isDeleted: false,
    },
  });

  if (seats.length !== uniqueSeatIds.length) {
    throw new CustomError({
      message: "One or more seats are invalid for this showtime",
      statusCode: 400,
    });
  }

  const existingReservedSeats = await prisma.reservedSeat.findMany({
    where: {
      showtimeId,
      seatId: { in: uniqueSeatIds },
      isDeleted: false,
    },
  });

  if (existingReservedSeats.length > 0) {
    throw new CustomError({
      message: "Some seats are already reserved for this showtime",
      statusCode: 409,
    });
  }

  const totalPrice = Number(showtime.priceForSeat) * uniqueSeatIds.length;

  const reservation = await prisma.$transaction(async (tx) => {
    const createdReservation = await tx.reservation.create({
      data: {
        userId,
        showtimeId,
        totalPrice,
        status: ReservationStatus.ACTIVE,
      },
    });

    await tx.reservedSeat.createMany({
      data: uniqueSeatIds.map((seatId) => ({
        reservationId: createdReservation.id,
        seatId,
        showtimeId,
      })),
    });

    const result = await tx.reservation.findUnique({
      where: { id: createdReservation.id },
      include: {
        showtime: {
          include: {
            movie: true,
            hall: true,
          },
        },
        reservedSeats: {
          include: {
            seat: true,
          },
        },
      },
    });

    if (!result) {
      throw new CustomError({
        message: "Failed to create reservation",
        statusCode: 500,
      });
    }

    return result;
  });

  return reservation;
};

export const getAllReservations = async (
  userId: string,
  isAdmin: boolean,
): Promise<ReservationWithDetails[]> => {
  const where: Record<string, unknown> = {};

  if (!isAdmin) {
    where.userId = userId;
  }

  return prisma.reservation.findMany({
    where,
    include: {
      showtime: {
        include: {
          movie: true,
          hall: true,
        },
      },
      reservedSeats: {
        include: {
          seat: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getReservationById = async (
  reservationId: string,
  userId: string,
  isAdmin: boolean,
): Promise<ReservationWithDetails> => {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      showtime: {
        include: {
          movie: true,
          hall: true,
        },
      },
      reservedSeats: {
        include: {
          seat: true,
        },
      },
    },
  });

  if (!reservation || reservation.isDeleted) {
    throw createNotExitError("Reservation");
  }

  if (!isAdmin && reservation.userId !== userId) {
    throw createForbiddenError();
  }

  return reservation;
};

export const cancelReservation = async (
  reservationId: string,
  userId: string,
  isAdmin: boolean,
): Promise<ReservationWithDetails> => {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      reservedSeats: true,
    },
  });

  if (!reservation || reservation.isDeleted) {
    throw createNotExitError("Reservation");
  }

  if (!isAdmin && reservation.userId !== userId) {
    throw createForbiddenError();
  }

  if (reservation.status === ReservationStatus.CANCELLED) {
    throw new CustomError({
      message: "Reservation is already cancelled",
      statusCode: 400,
    });
  }

  const updatedReservation = await prisma.$transaction(async (tx) => {
    await tx.reservedSeat.updateMany({
      where: {
        reservationId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.reservation.update({
      where: { id: reservationId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: ReservationStatus.CANCELLED,
      },
    });

    const result = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: {
        showtime: {
          include: {
            movie: true,
            hall: true,
          },
        },
        reservedSeats: {
          include: {
            seat: true,
          },
        },
      },
    });

    if (!result) {
      throw new CustomError({
        message: "Failed to cancel reservation",
        statusCode: 500,
      });
    }

    return result;
  });

  return updatedReservation;
};
