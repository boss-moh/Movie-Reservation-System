import { Movie } from "@generated/prisma/client";

export type CreateMovieDTO = Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateMovieDTO = Partial<CreateMovieDTO>;
