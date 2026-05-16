import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "@/test";
import { helpers } from "@/test/helper";
import { Showtime, Movie, Hall } from "@generated/prisma/client";

import * as ShowtimeService from "@/modules/showtime/services";
import { CreateShowtimeDTO } from "@/modules/showtime/type";

const validUUID = helpers.validUUID;
const anotherUUID = "223e4567-e89b-12d3-a456-426614174001";

const DBMovie: Movie = {
  id: validUUID,
  title: "Test Movie",
  description: "Test",
  durationMinutes: 120,
  genre: "Action",
  posterUrl: null,
  isDeleted: false,
  deletedAt: null,
};

const DBMovieDeleted: Movie = {
  ...DBMovie,
  isDeleted: true,
  deletedAt: new Date(),
};

const DBHall: Hall = {
  id: validUUID,
  name: "Hall A",
  seatsNumber: 50,
  status: "AVAILABLE",
};

const DBHallUnavailable: Hall = {
  ...DBHall,
  status: "UNAVAILABLE",
};

const DBHallMaintenance: Hall = {
  ...DBHall,
  status: "MAINTENANCE",
};

const DBShowtime: Showtime = {
  id: validUUID,
  movieId: validUUID,
  hallId: validUUID,
  startTime: new Date("2026-06-01T18:00:00Z"),
  priceForSeat: 12.5,
  isDeleted: false,
  deletedAt: null,
};

const DBShowtimeWithRelations = {
  ...DBShowtime,
  movie: DBMovie,
  hall: DBHall,
};

const DBShowtimeDeleted: Showtime = {
  ...DBShowtime,
  isDeleted: true,
  deletedAt: new Date(),
};

const createDTO: CreateShowtimeDTO = {
  movieId: validUUID,
  hallId: validUUID,
  startTime: new Date("2026-06-01T10:00:00Z"),
  priceForSeat: 15.0,
};

describe("ShowtimeService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    prismaMock.$transaction.mockImplementation(async (cb: Function) => {
      return cb(prismaMock);
    });
  });

  // ─── createShowtime ───────────────────────────────────────────────────

  describe("createShowtime", () => {
    it("creates a showtime when movie, hall exist and slot is free", async () => {
      prismaMock.movie.findUnique.mockResolvedValue(DBMovie);
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([]);
      prismaMock.showtime.create.mockResolvedValue(DBShowtime);

      const result = await ShowtimeService.createShowtime(createDTO);

      expect(result).toEqual(DBShowtime);
      expect(prismaMock.showtime.create).toHaveBeenCalledWith({
        data: {
          movieId: createDTO.movieId,
          hallId: createDTO.hallId,
          startTime: createDTO.startTime,
          priceForSeat: createDTO.priceForSeat,
        },
      });
    });

    it("throws 404 when movie does not exist", async () => {
      prismaMock.movie.findUnique.mockResolvedValue(null);

      await expect(ShowtimeService.createShowtime(createDTO)).rejects.toMatchObject({
        message: "'Movie' does not exist",
        statusCode: 404,
      });
    });

    it("throws 404 when movie is deleted", async () => {
      prismaMock.movie.findUnique.mockResolvedValue(DBMovieDeleted);

      await expect(ShowtimeService.createShowtime(createDTO)).rejects.toMatchObject({
        message: "Movie is deleted",
        statusCode: 404,
      });
    });

    it("throws 404 when hall does not exist", async () => {
      prismaMock.movie.findUnique.mockResolvedValue(DBMovie);
      prismaMock.hall.findUnique.mockResolvedValue(null);

      await expect(ShowtimeService.createShowtime(createDTO)).rejects.toMatchObject({
        message: "'Hall' does not exist",
        statusCode: 404,
      });
    });

    it("throws 400 when hall is UNAVAILABLE", async () => {
      prismaMock.movie.findUnique.mockResolvedValue(DBMovie);
      prismaMock.hall.findUnique.mockResolvedValue(DBHallUnavailable);

      await expect(ShowtimeService.createShowtime(createDTO)).rejects.toMatchObject({
        message: "Hall is not available or under maintenance",
        statusCode: 400,
      });
    });

    it("throws 400 when hall is MAINTENANCE", async () => {
      prismaMock.movie.findUnique.mockResolvedValue(DBMovie);
      prismaMock.hall.findUnique.mockResolvedValue(DBHallMaintenance);

      await expect(ShowtimeService.createShowtime(createDTO)).rejects.toMatchObject({
        message: "Hall is not available or under maintenance",
        statusCode: 400,
      });
    });

    it("throws 409 when slot is not free", async () => {
      prismaMock.movie.findUnique.mockResolvedValue(DBMovie);
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([
        {
          ...DBShowtime,
          startTime: new Date("2026-06-01T09:00:00Z"),
          movie: DBMovie,
        },
      ]);

      await expect(ShowtimeService.createShowtime(createDTO)).rejects.toMatchObject({
        message: "there are no free slot for this showtime",
        statusCode: 409,
      });
    });
  });

  // ─── getAllShowtimes ──────────────────────────────────────────────────

  describe("getAllShowtimes", () => {
    it("returns all showtimes with no filters", async () => {
      prismaMock.showtime.findMany.mockResolvedValue([DBShowtime]);

      const result = await ShowtimeService.getAllShowtimes({});

      expect(result).toHaveLength(1);
      expect(prismaMock.showtime.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        include: { movie: true, hall: true },
      });
    });

    it("filters by movieId", async () => {
      prismaMock.showtime.findMany.mockResolvedValue([DBShowtime]);

      await ShowtimeService.getAllShowtimes({ movieId: validUUID });

      expect(prismaMock.showtime.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ movieId: validUUID }),
        }),
      );
    });

    it("filters by hallId", async () => {
      prismaMock.showtime.findMany.mockResolvedValue([DBShowtime]);

      await ShowtimeService.getAllShowtimes({ hallId: validUUID });

      expect(prismaMock.showtime.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ hallId: validUUID }),
        }),
      );
    });

    it("filters by date range (from/to)", async () => {
      prismaMock.showtime.findMany.mockResolvedValue([DBShowtime]);
      const from = "2026-06-01T00:00:00Z";
      const to = "2026-06-02T00:00:00Z";

      await ShowtimeService.getAllShowtimes({ from, to });

      const callArgs = prismaMock.showtime.findMany.mock.calls[0][0] as { where: { startTime: { gte: Date; lte: Date } } };
      expect(callArgs.where.startTime.gte).toBeInstanceOf(Date);
      expect(callArgs.where.startTime.lte).toBeInstanceOf(Date);
    });
  });

  // ─── getShowtimeById ──────────────────────────────────────────────────

  describe("getShowtimeById", () => {
    it("returns a showtime when found", async () => {
      prismaMock.showtime.findUnique.mockResolvedValue(DBShowtime);

      const result = await ShowtimeService.getShowtimeById(validUUID);

      expect(result).toEqual(DBShowtime);
    });

    it("throws 404 when showtime does not exist", async () => {
      prismaMock.showtime.findUnique.mockResolvedValue(null);

      await expect(ShowtimeService.getShowtimeById(validUUID)).rejects.toMatchObject({
        message: "'Showtime' does not exist",
        statusCode: 404,
      });
    });
  });

  // ─── updateShowtime ───────────────────────────────────────────────────

  describe("updateShowtime", () => {
    beforeEach(() => {
      prismaMock.showtime.findUnique.mockResolvedValue(DBShowtimeWithRelations);
    });

    it("throws 404 when showtime does not exist", async () => {
      prismaMock.showtime.findUnique.mockResolvedValue(null);

      await expect(
        ShowtimeService.updateShowtime(validUUID, { priceForSeat: 20 }),
      ).rejects.toMatchObject({
        message: "'Showtime' does not exist",
        statusCode: 404,
      });
    });

    it('case 0001: updates only priceForSeat', async () => {
      prismaMock.showtime.update.mockResolvedValue({ ...DBShowtime, priceForSeat: 20 });

      const result = await ShowtimeService.updateShowtime(validUUID, { priceForSeat: 20 });

      expect(result.priceForSeat).toBe(20);
      expect(prismaMock.showtime.update).toHaveBeenCalledWith({
        where: { id: validUUID },
        data: { priceForSeat: 20 },
      });
    });

    it('case 0010: updates only startTime', async () => {
      const newTime = new Date("2026-06-01T14:00:00Z");
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([]);
      prismaMock.showtime.update.mockResolvedValue({ ...DBShowtime, startTime: newTime });

      const result = await ShowtimeService.updateShowtime(validUUID, { startTime: newTime });

      expect(result.startTime).toEqual(newTime);
    });

    it('case 0011: updates startTime and price', async () => {
      const newTime = new Date("2026-06-01T14:00:00Z");
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([]);
      prismaMock.showtime.update.mockResolvedValue({ ...DBShowtime, startTime: newTime, priceForSeat: 25 });

      const result = await ShowtimeService.updateShowtime(validUUID, { startTime: newTime, priceForSeat: 25 });

      expect(result.startTime).toEqual(newTime);
      expect(result.priceForSeat).toBe(25);
    });

    it('case 0100: updates hallId', async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([]);
      prismaMock.showtime.update.mockResolvedValue({ ...DBShowtime, hallId: anotherUUID });

      const result = await ShowtimeService.updateShowtime(validUUID, { hallId: anotherUUID });

      expect(result.hallId).toBe(anotherUUID);
    });

    it('case 0101: updates hallId and price', async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([]);
      prismaMock.showtime.update.mockResolvedValue({ ...DBShowtime, hallId: anotherUUID, priceForSeat: 30 });

      const result = await ShowtimeService.updateShowtime(validUUID, { hallId: anotherUUID, priceForSeat: 30 });

      expect(result.hallId).toBe(anotherUUID);
      expect(result.priceForSeat).toBe(30);
    });

    it('case 0100: throws 409 when no free slot in new hall', async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([
        {
          ...DBShowtime,
          startTime: new Date("2026-06-01T17:30:00Z"),
          movie: DBMovie,
        },
      ]);

      await expect(
        ShowtimeService.updateShowtime(validUUID, { hallId: anotherUUID }),
      ).rejects.toMatchObject({
        message: expect.stringContaining("no free slot"),
        statusCode: 409,
      });
    });

    it('case 1000: updates movieId', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(DBMovie);
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([]);
      prismaMock.showtime.update.mockResolvedValue({ ...DBShowtime, movieId: anotherUUID });

      const result = await ShowtimeService.updateShowtime(validUUID, { movieId: anotherUUID });

      expect(result.movieId).toBe(anotherUUID);
    });

    it('case 1001: updates movieId and price', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(DBMovie);
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([]);
      prismaMock.showtime.update.mockResolvedValue({ ...DBShowtime, movieId: anotherUUID, priceForSeat: 35 });

      const result = await ShowtimeService.updateShowtime(validUUID, { movieId: anotherUUID, priceForSeat: 35 });

      expect(result.movieId).toBe(anotherUUID);
      expect(result.priceForSeat).toBe(35);
    });

    it("throws 400 for unexpected combination (movie + hall together)", async () => {
      await expect(
        ShowtimeService.updateShowtime(validUUID, { movieId: anotherUUID, hallId: anotherUUID }),
      ).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("throws 400 for changing hall and movieId together", async () => {
      await expect(
        ShowtimeService.updateShowtime(validUUID, {
          movieId: anotherUUID,
          hallId: anotherUUID,
          startTime: new Date(),
          priceForSeat: 20,
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  // ─── deleteShowtime ───────────────────────────────────────────────────

  describe("deleteShowtime", () => {
    it("soft deletes a showtime", async () => {
      prismaMock.showtime.findUnique.mockResolvedValue(DBShowtime);
      prismaMock.showtime.update.mockResolvedValue(DBShowtimeDeleted);

      const result = await ShowtimeService.deleteShowtime(validUUID);

      expect(result).toEqual({ message: "Showtime deleted successfully" });
      expect(prismaMock.showtime.update).toHaveBeenCalledWith({
        where: { id: validUUID },
        data: { isDeleted: true, deletedAt: expect.any(Date) },
      });
    });

    it("throws 404 when showtime does not exist", async () => {
      prismaMock.showtime.findUnique.mockResolvedValue(null);

      await expect(ShowtimeService.deleteShowtime(validUUID)).rejects.toMatchObject({
        message: "'Showtime' does not exist",
        statusCode: 404,
      });
    });
  });

  // ─── restoreShowtime ──────────────────────────────────────────────────

  describe("restoreShowtime", () => {
    it("restores a soft-deleted showtime", async () => {
      prismaMock.showtime.findUnique.mockResolvedValue(DBShowtimeDeleted);
      prismaMock.showtime.update.mockResolvedValue(DBShowtime);

      const result = await ShowtimeService.restoreShowtime(validUUID);

      expect(result).toEqual({ message: "Showtime restored successfully" });
      expect(prismaMock.showtime.update).toHaveBeenCalledWith({
        where: { id: validUUID },
        data: { isDeleted: false, deletedAt: null },
      });
    });

    it("throws 404 when showtime does not exist", async () => {
      prismaMock.showtime.findUnique.mockResolvedValue(null);

      await expect(ShowtimeService.restoreShowtime(validUUID)).rejects.toMatchObject({
        message: "'Showtime' does not exist",
        statusCode: 404,
      });
    });
  });

  // ─── getFreeSlots ─────────────────────────────────────────────────────

  describe("getFreeSlots", () => {
    it("returns the full day as one slot when no showtimes exist", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([]);

      const slots = await ShowtimeService.getFreeSlots(validUUID, "2026-06-01");

      expect(slots).toHaveLength(1);
      expect(slots[0].durationMinutes).toBe(24 * 60);
    });

    it("returns correct gaps between showtimes", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([
        {
          ...DBShowtime,
          startTime: new Date("2026-06-01T10:00:00.000Z"),
          movie: DBMovie,
        },
      ]);

      const slots = await ShowtimeService.getFreeSlots(validUUID, "2026-06-01");

      expect(slots).toHaveLength(2);
      expect(slots[0].start).toEqual(new Date("2026-06-01T00:00:00.000Z"));
      expect(slots[0].end).toEqual(new Date("2026-06-01T10:00:00.000Z"));
      expect(slots[0].durationMinutes).toBe(600);
      expect(slots[1].start).toEqual(new Date("2026-06-01T12:00:00.000Z"));
      expect(slots[1].end).toEqual(new Date("2026-06-01T23:59:59.999Z"));
    });

    it("returns correct gaps with multiple showtimes", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([
        {
          ...DBShowtime,
          id: "s1",
          startTime: new Date("2026-06-01T09:00:00.000Z"),
          movie: DBMovie,
        },
        {
          ...DBShowtime,
          id: "s2",
          startTime: new Date("2026-06-01T14:00:00.000Z"),
          movie: DBMovie,
        },
      ]);

      const slots = await ShowtimeService.getFreeSlots(validUUID, "2026-06-01");

      expect(slots).toHaveLength(3);
      expect(slots[0].durationMinutes).toBe(540);
      expect(slots[1].durationMinutes).toBe(180);
      expect(slots[2].durationMinutes).toBe(480);
    });

    it("excludes a showtime ID when provided", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([]);

      await ShowtimeService.getFreeSlots(validUUID, "2026-06-01", validUUID);

      expect(prismaMock.showtime.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: validUUID },
          }),
        }),
      );
    });

    it("throws 404 when hall does not exist", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(null);

      await expect(ShowtimeService.getFreeSlots(validUUID)).rejects.toMatchObject({
        message: "'Hall' does not exist",
        statusCode: 404,
      });
    });

    it("throws 400 when hall is UNAVAILABLE", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHallUnavailable);

      await expect(ShowtimeService.getFreeSlots(validUUID)).rejects.toMatchObject({
        message: "Hall is not available or under maintenance",
        statusCode: 400,
      });
    });

    it("throws 400 when hall is MAINTENANCE", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHallMaintenance);

      await expect(ShowtimeService.getFreeSlots(validUUID)).rejects.toMatchObject({
        message: "Hall is not available or under maintenance",
        statusCode: 400,
      });
    });
  });

  // ─── getOccupiedSlots ─────────────────────────────────────────────────

  describe("getOccupiedSlots", () => {
    it("returns empty array when no showtimes exist", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([]);

      const result = await ShowtimeService.getOccupiedSlots(validUUID, "2026-06-01");

      expect(result).toEqual([]);
    });

    it("returns occupied slots with metadata", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([
        {
          ...DBShowtime,
          startTime: new Date("2026-06-01T10:00:00.000Z"),
          movie: DBMovie,
        },
      ]);

      const result = await ShowtimeService.getOccupiedSlots(validUUID, "2026-06-01");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        start: new Date("2026-06-01T10:00:00.000Z"),
        showtimeId: validUUID,
        minutes: 120,
        name: "Test Movie",
      });
    });

    it("throws 404 when hall does not exist", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(null);

      await expect(ShowtimeService.getOccupiedSlots(validUUID)).rejects.toMatchObject({
        message: "'Hall' does not exist",
        statusCode: 404,
      });
    });
  });

  // ─── checkThereFreeSlotForShowTime ────────────────────────────────────

  describe("checkThereFreeSlotForShowTime", () => {
    it("returns true when a free slot fits the requested time and duration", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([]);

      const result = await ShowtimeService.checkThereFreeSlotForShowTime(
        validUUID,
        new Date("2026-06-01T10:00:00.000Z"),
        120,
      );

      expect(result).toBe(true);
    });

    it("returns false when the requested slot overlaps an existing showtime", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([
        {
          ...DBShowtime,
          startTime: new Date("2026-06-01T10:00:00.000Z"),
          movie: DBMovie,
        },
      ]);

      const result = await ShowtimeService.checkThereFreeSlotForShowTime(
        validUUID,
        new Date("2026-06-01T09:00:00.000Z"),
        180,
      );

      expect(result).toBe(false);
    });

    it("returns true when excluding own ID allows the slot", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHall);
      prismaMock.showtime.findMany.mockResolvedValue([]);

      const result = await ShowtimeService.checkThereFreeSlotForShowTime(
        validUUID,
        new Date("2026-06-01T10:00:00.000Z"),
        120,
        validUUID,
      );

      expect(result).toBe(true);
    });

    it("returns false when hall is unavailable", async () => {
      prismaMock.hall.findUnique.mockResolvedValue(DBHallUnavailable);

      await expect(
        ShowtimeService.checkThereFreeSlotForShowTime(
          validUUID,
          new Date("2026-06-01T10:00:00.000Z"),
          120,
        ),
      ).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });
});
