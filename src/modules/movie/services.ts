import { prisma } from "@/libs/prisma";
import CustomError from "@/errors/CustomError";
import { CreateMovieDTO, UpdateMovieDTO } from "./type";

export const createMovie = async (data: CreateMovieDTO) => {
  const movie = await prisma.movie.create({
    data,
  });
  return movie;
};

export const getAllMovies = async () => {
  const movies = await prisma.movie.findMany();
  return movies;
};

export const getMovieById = async (id: string) => {
  const movie = await prisma.movie.findUnique({
    where: { id },
  });
  if (!movie) {
    throw new CustomError({ message: "Movie not found", statusCode: 404 });
  }
  return movie;
};

export const updateMovie = async (id: string, data: UpdateMovieDTO) => {
  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) {
    throw new CustomError({ message: "Movie not found", statusCode: 404 });
  }
  const updatedMovie = await prisma.movie.update({
    where: { id },
    data,
  });
  return updatedMovie;
};

export const deleteMovie = async (id: string) => {
  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) {
    throw new CustomError({ message: "Movie not found", statusCode: 404 });
  }

  await prisma.movie.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  return { message: "Movie deleted successfully" };
};


export const restoreMovie = async (id: string) => {
  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) {
    throw new CustomError({ message: "Movie not found", statusCode: 404 });
  }

  await prisma.movie.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
  });
  return { message: "Movie restored successfully" };
};