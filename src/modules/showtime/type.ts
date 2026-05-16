import { Showtime } from "@generated/prisma/browser";

export type CreateShowtimeDTO = Omit<Showtime, "id" | "isDeleted" | "deletedAt">;

export type UpdateShowtimeDTO = Partial<CreateShowtimeDTO>;


export type FreeSlot = {
  start: Date;
  end: Date;
  durationMinutes: number;
};
