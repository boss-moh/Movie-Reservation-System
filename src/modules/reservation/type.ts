import { Reservation, Showtime, ReservedSeat, Seat, Movie, Hall } from "@generated/prisma/client";

export type CreateReservationDTO = {
  showtimeId: string;
  seatIds: string[];
};

export type ReservationWithDetails = Reservation & {
  showtime: Showtime & {
    movie: Movie;
    hall: Hall;
  };
  reservedSeats: Array<ReservedSeat & { seat: Seat }>;
};
