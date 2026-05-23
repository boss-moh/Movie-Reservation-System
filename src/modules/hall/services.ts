import { prisma } from "@/libs/prisma/config";
import { createNotExitError } from "@/errors";
import {
  CreateHallDTO,
  UpdateHallDTO,
} from "@/modules/hall/type";


export const createHall = async (data: CreateHallDTO) => {
  const { seatsNumber, name, status } = data;



  const hall =  prisma.hall.create({
    data: {
      name,
      seatsNumber,
      ...(status ? { status } : {}),
      seats: {
        create: Array(seatsNumber).fill({})
      }
    },
      include: {
      seats: true,
    }
  });
  
  return hall;
};

export const getAllHalls = async () => {
 const halls = await prisma.hall.findMany({
    include: {
      seats: true,
    }
  })
  
  return halls
  };

export const getHallById = async (id: string) => {
  const hall = await prisma.hall.findUnique({
    where: { id },
    include: {
      seats: true,
    },
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


  const { name, seatsNumber, status } = data
  return prisma.hall.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(seatsNumber ? { seatsNumber } : {}),
      ...(status ? { status } : {})
    },
  });
};
