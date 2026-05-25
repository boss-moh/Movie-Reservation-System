import { Showtime } from "@generated/prisma/browser";

export type CreateShowtimeDTO = Omit<Showtime, "id" | "isDeleted" | "deletedAt">;

export type UpdateShowtimeDTO = Partial<CreateShowtimeDTO>;


export type Slot = {
  start: Date;
  end: Date;
};


export type FreeSlot = Slot & {
  
  durationMinutes:number
};


