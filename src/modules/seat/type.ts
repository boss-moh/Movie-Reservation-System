import { SeatType } from "@generated/prisma/browser";

export type CreateSeatDTO = {
  hallId: string;
  type?: SeatType;
};

export type UpdateSeatDTO = Partial<Omit<CreateSeatDTO, "hallId">>;

