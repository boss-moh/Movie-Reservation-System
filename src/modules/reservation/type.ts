import { Reservation, ReservedSeat } from "@generated/prisma/client";


export type SingleReservation = Reservation ;
export type CreateReservationDTO = {
  showtimeId: string;
  seatIds: string[];
};




export type ReservationWithDetails = Reservation & {

  reservedSeats: ReservedSeat[]
};
