import { prisma } from "@/libs/prisma";
import { createNotExitError } from "@/errors";
import { Role } from "@generated/prisma/enums";

import { getUserDTO, getUserWithoutPassword } from "@/utils";





export const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  return users.map((user) => getUserWithoutPassword(user));
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw createNotExitError("User");
  }

  return getUserWithoutPassword(user);
};




export const promoteToAdmin = async (id: string, role: Role) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) throw createNotExitError("User");

  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });
  return getUserDTO(user);
};


export const restoreUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw createNotExitError("User");
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null,
    },
  });

  return getUserWithoutPassword(user);
};



export const deleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw createNotExitError("User");
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return getUserWithoutPassword(user);
};
