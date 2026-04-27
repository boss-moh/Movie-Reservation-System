import { prisma } from "@/libs/prisma";
import { createNotExitError } from "@/errors";
import {
  CreateHallDTO,
  UpdateHallDTO,
} from "./type";


export const createHall = async (data: CreateHallDTO) => {

  const seats = data.seats ?? [];
  const hasSeats = seats.length > 0;
  return prisma.hall.create({
    data: {
      name: data.name,
      seatsNumber: data.seatsNumber ?? 0,
      seats: hasSeats ?
        { create: seats } : {},
    }
  });
};

export const getAllHalls = async () => {
  return prisma.hall.findMany();
};

export const getHallById = async (id: string) => {
  const hall = await prisma.hall.findUnique({
    where: { id },
  });

  if (!hall) {
    throw createNotExitError("Hall");
  }

  return hall;
};

export const updateHall = async (id: string, data: UpdateHallDTO) => {
  const hall = await prisma.hall.findUnique({ where: { id } });

  if (!hall) {
    throw createNotExitError("Hall");
  }

  return prisma.hall.update({
    where: { id },
    data,
  });
};

export const deleteHall = async (id: string) => {
  const hall = await prisma.hall.findUnique({ where: { id } });

  if (!hall) {
    throw createNotExitError("Hall");
  }

  await prisma.hall.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return { message: "Hall deleted successfully" };
};

export const restoreHall = async (id: string) => {
  const hall = await prisma.hall.findUnique({ where: { id } });

  if (!hall) {
    throw createNotExitError("Hall");
  }

  await prisma.hall.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null,
    },
  });

  return { message: "Hall restored successfully" };
};

