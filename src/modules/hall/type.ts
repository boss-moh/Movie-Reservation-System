import { Request } from "express";

export type CreateSeatDTO = {
  type?: string;
};

export type CreateHallDTO = {
  name: string;
  seatsNumber?: number;
  seats?: CreateSeatDTO[];
};

export type UpdateHallDTO = Partial<Pick<CreateHallDTO, "name" | "seatsNumber">>;

export type UpdateSeatDTO = Partial<CreateSeatDTO>;


export type RequestWithHallAndSeat = Request & { params: { hallId: string; seatId: string } };

