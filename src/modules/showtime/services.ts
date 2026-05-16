import { prisma } from "@/libs/prisma";
import { createNotExitError, CustomError } from "@/errors";
import { CreateShowtimeDTO, UpdateShowtimeDTO, FreeSlot } from "@/modules/showtime/type";

export const createShowtime = async (data: CreateShowtimeDTO) => {
  const { movieId, hallId, startTime, priceForSeat } = data;

  const findMovie = async () => await prisma.movie.findUnique({ where: { id: movieId } })
  const findHall = async () => await prisma.hall.findUnique({ where: { id: hallId } })

  const [movie, hall] = await Promise.all([findMovie(), findHall()])
  if (!movie) {
    throw createNotExitError("Movie");
  }
  if (movie.isDeleted) {
    throw new CustomError({ message: "Movie is deleted", statusCode: 404 });
  }

  if (!hall) {
    throw createNotExitError("Hall");
  }
  if (hall.status === "UNAVAILABLE" || hall.status === "MAINTENANCE") {
    throw new CustomError({ message: "Hall is not available or under maintenance", statusCode: 400 });
  }

  const hasFreeSlotForShowTime = await checkThereFreeSlotForShowTime(hallId, startTime, movie.durationMinutes)
  if (!hasFreeSlotForShowTime) throw new CustomError({
    message: "there are no free slot for this showtime",
    statusCode: 409
  })

  return prisma.showtime.create({
    data: {
      movieId,
      hallId,
      startTime,
      priceForSeat,
    },
  });
};

export const getAllShowtimes = async (filters: {
  movieId?: string;
  hallId?: string;
  from?: string;
  to?: string;
}) => {
  const { movieId, hallId, from, to } = filters;

  const where: Record<string, unknown> = {
    isDeleted: false,

  };

  if (movieId) where.movieId = movieId;
  if (hallId) where.hallId = hallId;
  if (from || to) {
    where.startTime = {};
    if (from) (where.startTime as Record<string, unknown>).gte = new Date(from);
    if (to) (where.startTime as Record<string, unknown>).lte = new Date(to);
  }

  return prisma.showtime.findMany({
    where,
    include: {
      movie: true,
      hall: true,
    },
  });
};

export const getShowtimeById = async (id: string) => {
  const showtime = await prisma.showtime.findUnique({
    where: { id },
    include: {
      movie: true,
      hall: true,
    },
  });

  if (!showtime) {
    throw createNotExitError("Showtime");
  }

  return showtime;
};

export const updateShowtime = async (showtimeId: string, data: UpdateShowtimeDTO) => {
  const showtimeOldData = await prisma.showtime.findUnique({
    where: { id: showtimeId },
    include: {
      movie: true,
      hall: true,
    },
  });

  if (!showtimeOldData) {
    throw createNotExitError("Showtime");
  }


  const { movieId, hallId, startTime, priceForSeat } = data;



  const code = `${movieId ? 1 : 0}${hallId ? 1 : 0}${startTime ? 1 : 0}${priceForSeat ? 1 : 0}`



  switch (code) {
    case "0001": // change price
      return prisma.showtime.update({
        where: { id: showtimeId },
        data: {
          priceForSeat: priceForSeat!,
        },
      });


    case "0010": // change time 
    case "0011": // change time with price 
      return await prisma.$transaction(async (prisma) => {

        const isThereFreeSlotForShowTime = await checkThereFreeSlotForShowTime(showtimeOldData.hallId, new Date(startTime!), showtimeOldData.movie.durationMinutes, showtimeId)
        console.log(isThereFreeSlotForShowTime, "isThereFreeSlotForShowTime")
        if (!isThereFreeSlotForShowTime) throw new CustomError({
          message: `there are no free slot for this showtime with time ${startTime}`,
          statusCode: 409
        })
        const newShowtime = await prisma.showtime.update({
          where: { id: showtimeId },
          data: {
            startTime: new Date(startTime!),
            priceForSeat: priceForSeat || showtimeOldData.priceForSeat,
          }
        })
        return newShowtime
      })

    case "0100": // change hall
    case "0101": // change hall with price
      return await prisma.$transaction(async (prisma) => {

        const isThereFreeSlotForShowTime = await checkThereFreeSlotForShowTime(hallId!, showtimeOldData.startTime, showtimeOldData.movie.durationMinutes)
        if (!isThereFreeSlotForShowTime) throw new CustomError({
          message: `there are no free slot for this showtime in hall with id ${hallId} with time ${showtimeOldData.startTime}`,
          statusCode: 409
        })

        const newShowtime = await prisma.showtime.update({
          where: { id: showtimeId },
          data: {
            hallId: hallId!,
            priceForSeat: priceForSeat || showtimeOldData.priceForSeat,
          }
        })
        return newShowtime


      })



    case "1000": // change movie
    case "1001": // change movie with price
      return await prisma.$transaction(async (prisma) => {

        const newMovie = await prisma.movie.findUnique({ where: { id: movieId! } })

        if (!newMovie) {
          throw createNotExitError("Movie")
        }

        const isThereFreeSlotForShowTime = await checkThereFreeSlotForShowTime(showtimeOldData.hallId, showtimeOldData.startTime, newMovie.durationMinutes, showtimeId)
        if (!isThereFreeSlotForShowTime) throw new CustomError({
          message: `there are no free slot for this showtime in hall with id ${showtimeOldData.hallId} for the new movie with id ${newMovie.id} and duration ${newMovie.durationMinutes}`,
          statusCode: 409
        })

        const newShowtime = await prisma.showtime.update({
          where: { id: showtimeId },
          data: {
            movieId: movieId!,
            priceForSeat: priceForSeat || showtimeOldData.priceForSeat,
          }
        })
        return newShowtime


      })

    default:
      throw new CustomError({
        message: "unExpected request may you need to change hall and movie in two different requests " + code,
        statusCode: 400
      });
  }
};

export const deleteShowtime = async (id: string) => {
  const showtime = await prisma.showtime.findUnique({ where: { id } });

  if (!showtime) {
    throw createNotExitError("Showtime");
  }

  await prisma.showtime.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return { message: "Showtime deleted successfully" };
};

export const restoreShowtime = async (id: string) => {
  const showtime = await prisma.showtime.findUnique({ where: { id } });

  if (!showtime) {
    throw createNotExitError("Showtime");
  }


  await prisma.showtime.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
  });

  return { message: "Showtime restored successfully" };
};


export const getFreeSlots = async (hallId: string, date?: string, excludeId?: string) => {

  const hall = await prisma.hall.findUnique({ where: { id: hallId } });
  if (!hall) {
    throw createNotExitError("Hall");
  }

  if (hall.status === "UNAVAILABLE" || hall.status === "MAINTENANCE") {
    throw new CustomError({ message: "Hall is not available or under maintenance", statusCode: 400 });
  }

  const targetDate = date ? new Date(date) : new Date();
  const [year, month, day] = [targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()]

  const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));


  const showtimes = await prisma.showtime.findMany({
    where: {
      hallId,
      isDeleted: false,
      startTime: {
        gte: startOfDay.toISOString(),
        lte: endOfDay.toISOString(),
      },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    include: {
      movie: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });


  if (showtimes.length == 0) {
    return [{ start: startOfDay, end: endOfDay, durationMinutes: 24 * 60 }];
  }


  const occupied: { start: Date; end: Date }[] = showtimes.map((s) => ({
    start: s.startTime,
    end: new Date(s.startTime.getTime() + s.movie.durationMinutes * 60000),
  }));

  const slots: FreeSlot[] = [];
  let cursor = startOfDay;

  for (const block of occupied) {
    if (cursor < block.start) {
      const gapMinutes = (block.start.getTime() - cursor.getTime()) / 60000;
      slots.push({ start: cursor, end: block.start, durationMinutes: Math.round(gapMinutes) });
    }
    if (block.end > cursor) {
      cursor = block.end;
    }
  }

  if (cursor < endOfDay) {
    const gapMinutes = (endOfDay.getTime() - cursor.getTime()) / 60000;
    slots.push({ start: cursor, end: endOfDay, durationMinutes: Math.round(gapMinutes) });
  }


  return slots;
};

export const getOccupiedSlots = async (hallId: string, date?: string) => {
  const hall = await prisma.hall.findUnique({ where: { id: hallId } });
  if (!hall) {
    throw createNotExitError("Hall");
  }



  const targetDate = date ? new Date(date) : new Date();
  const [year, month, day] = [targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()]

  const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));


  const showtimes = await prisma.showtime.findMany({
    where: {
      hallId,
      isDeleted: false,
      startTime: {
        gte: startOfDay.toISOString(),
        lte: endOfDay.toISOString(),
      },
    },
    include: {
      movie: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });


  if (showtimes.length == 0) {
    return [];
  }


  const occupied: { start: Date; end: Date }[] = showtimes.map((s) => ({
    start: s.startTime,
    end: new Date(s.startTime.getTime() + s.movie.durationMinutes * 60000),
    showtimeId: s.id,
    minutes: s.movie.durationMinutes,
    name: s.movie.title,
  }));

  return occupied;
}


export const checkThereFreeSlotForShowTime = async (hallId: string, startTime: Date, durationMinutes: number, excludeId?: string) => {

  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000)


  const slots = await getFreeSlots(hallId, startDate.toISOString(), excludeId);

  return slots.some((s) => s.start <= startDate && endDate <= s.end)

}



