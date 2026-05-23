import { Hall, Status,Seat } from "@generated/prisma/browser";



export type CreateHallDTO = Omit<Hall, "id" | "status"> & {
  status?: Status
};

export type UpdateHallDTO = Partial<CreateHallDTO>;





export type HallWithSeats = Hall & {
  seats: Seat[]
}
