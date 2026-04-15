import jwt from "jsonwebtoken";
import { prisma } from "@/libs/prisma"; // Assuming you exported prisma client here
import { RegisterDTO, LoginDTO, getUserDTO, getUserWithoutPassword } from "./type";

import { JWT_REFRESH_SECRET, JWT_SECRET } from "@/config";
import {
  createEntityWithSameInfoError,
  createNotExitError,
  createInvalidError,
} from "@/errors";

import { Role } from "@generated/prisma/enums";
import CustomError from "@/errors/CustomError";
import { comparePassword, getHashPassword } from "@/utils/getHashPassword";

export const register = async (data: RegisterDTO) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) throw createEntityWithSameInfoError("email", "User");

  const hashedPassword = await getHashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      hashPassword: hashedPassword,
      keyForHashing: "salt",
      role: "USER",
    },
  });
  return getUserDTO(user);
};

export const login = async (data: LoginDTO) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) throw createNotExitError("email");

  const isValid = await comparePassword(data.password, user.hashPassword);
  if (!isValid) throw createInvalidError();

  const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return {
    accessToken,
    refreshToken,
    user: getUserDTO(user),
  };
};

export const promoteToAdmin = async (id: string, role: Role) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) throw createNotExitError("email");

  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });
  return getUserDTO(user);
};

// #ToDo: verfiy the refresh token, if valid issue a new access token, if not throw an error
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      sub: string;
      role: Role;
    };

    const userId = decoded.sub;
    const role = decoded.role;
    const accessToken = jwt.sign({ sub: userId, role: role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return {
      accessToken,
    };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw new CustomError({
        message: "Refresh token expired",
        statusCode: 401,
      });
    }
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof SyntaxError
    ) {
      throw new CustomError({
        message: "Invalid refresh token",
        statusCode: 401,
      });
    }

    throw error;
  }
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