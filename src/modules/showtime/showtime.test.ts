import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app.js";
import { prismaMock } from "@/test";
import { helpers } from "@/test/helper";
import { Showtime, Movie, Hall } from "@generated/prisma/client";
import { CreateShowtimeDTO } from "@/modules/showtime/type";

const createShowtimePayload: CreateShowtimeDTO = {
  movieId: helpers.validUUID,
  hallId: helpers.validUUID,
  startTime: new Date("2026-06-01T18:00:00Z"),
  priceForSeat: 12.5,
};

const DBMovie: Movie = {
  id: helpers.validUUID,
  title: "Test Movie",
  description: "Test",
  durationMinutes: 120,
  genre: "Action",
  posterUrl: null,
  isDeleted: false,
  deletedAt: null,
};

const DBHall: Hall = {
  id: helpers.validUUID,
  name: "Hall A",
  seatsNumber: 50,
  status: "AVAILABLE",
};

const DBShowtime: Showtime = {
  id: helpers.validUUID,
  movieId: helpers.validUUID,
  hallId: helpers.validUUID,
  startTime: new Date("2026-06-01T18:00:00Z"),
  priceForSeat: 12.5,
  isDeleted: false,
  deletedAt: null,
};


describe("Showtime API Endpoints", () => {
  describe("GET /api/showtimes", () => {
    it("returns 200 and a list of all showtimes", async () => {
      prismaMock.showtime.findMany.mockResolvedValueOnce([DBShowtime]);
      const res = await request(app).get("/api/showtimes");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe("GET /api/showtimes/:id", () => {
    it("returns 200 and a showtime by ID", async () => {
      prismaMock.showtime.findUnique.mockResolvedValueOnce(DBShowtime);
      const res = await request(app).get(`/api/showtimes/${helpers.validUUID}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(helpers.validUUID);
    });

    it("returns 404 if showtime does not exist", async () => {
      prismaMock.showtime.findUnique.mockResolvedValueOnce(null);
      const res = await request(app).get(`/api/showtimes/${helpers.validUUID}`);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/showtimes (Admin only)", () => {
    // it("returns 201 and creates a showtime when user is admin", async () => {
    //   const token = await helpers.getTokenAdmin();
    //   prismaMock.movie.findUnique.mockResolvedValueOnce(DBMovie);
    //   prismaMock.hall.findUnique.mockResolvedValueOnce(DBHall);
    //   prismaMock.showtime.findMany.mockResolvedValueOnce([]);
    //   prismaMock.showtime.create.mockResolvedValueOnce(DBShowtime);

    //   const res = await request(app)
    //     .post("/api/showtimes")
    //     .set("Authorization", `Bearer ${token}`)
    //     .send(createShowtimePayload);

    //   expect(res.status).toBe(201);
    //   console.log(res.body)
    //   expect(res.body.movieId).toBe(createShowtimePayload.movieId);
    // });

    it("returns 403 when user is not an admin", async () => {
      const token = await helpers.getTokenUser();
      const res = await request(app)
        .post("/api/showtimes")
        .set("Authorization", `Bearer ${token}`)
        .send(createShowtimePayload);
      expect(res.status).toBe(403);
    });

    it("returns 401 when no token is provided", async () => {
      const res = await request(app).post("/api/showtimes").send(createShowtimePayload);
      expect(res.status).toBe(401);
    });

    // it("returns 409 when showtime overlaps", async () => {
    //   const token = await helpers.getTokenAdmin();
    //   prismaMock.movie.findUnique.mockResolvedValueOnce(DBMovie);
    //   prismaMock.hall.findUnique.mockResolvedValueOnce(DBHall);
    //   prismaMock.showtime.findMany.mockResolvedValueOnce([DBShowtime]);
    //   prismaMock.movie.findUnique.mockResolvedValueOnce(DBMovie);

    //   const res = await request(app)
    //     .post("/api/showtimes")
    //     .set("Authorization", `Bearer ${token}`)
    //     .send(createShowtimePayload);

    //   expect(res.status).toBe(409);
    // });
  });

  describe("PUT /api/showtimes/:id (Admin only)", () => {
    it("returns 200 and updates a showtime when user is admin", async () => {
      const token = await helpers.getTokenAdmin();
      prismaMock.showtime.findUnique.mockResolvedValueOnce(DBShowtime);
      prismaMock.movie.findUnique.mockResolvedValueOnce(DBMovie);
      prismaMock.hall.findUnique.mockResolvedValueOnce(DBHall);
      prismaMock.showtime.findMany.mockResolvedValueOnce([]);
      prismaMock.showtime.update.mockResolvedValueOnce({
        ...DBShowtime,
        priceForSeat: 15.0,
      });

      const res = await request(app)
        .put(`/api/showtimes/${helpers.validUUID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ priceForSeat: 15.0 });

      expect(res.status).toBe(200);
      expect(res.body.priceForSeat).toBe(15.0);
    });

    it("returns 404 if showtime to update does not exist", async () => {
      const token = await helpers.getTokenAdmin();
      prismaMock.showtime.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/api/showtimes/${helpers.validUUID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ priceForSeat: 15.0 });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/showtimes/:id (Admin only)", () => {
    it("returns 200 and soft deletes a showtime", async () => {
      const token = await helpers.getTokenAdmin();
      prismaMock.showtime.findUnique.mockResolvedValueOnce(DBShowtime);
      prismaMock.showtime.update.mockResolvedValueOnce({
        ...DBShowtime,
        isDeleted: true,
        deletedAt: new Date(),
      });

      const res = await request(app)
        .delete(`/api/showtimes/${helpers.validUUID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Showtime deleted successfully");
    });
  });


  describe("GET /api/showtimes/free-slots", () => {
    it("returns 200 and free slots for a hall", async () => {
      prismaMock.hall.findUnique.mockResolvedValueOnce(DBHall);
      prismaMock.showtime.findMany.mockResolvedValueOnce([]);

      const res = await request(app)
        .get("/api/showtimes/free-slots")
        .query({ date: "2026-06-01" })
        .send({ hallId: helpers.validUUID });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("returns 200 and filters slots by durationMinutes", async () => {
      const existingShowtime = {
        ...DBShowtime,
        startTime: new Date("2026-06-01T10:00:00Z"),
        movie: DBMovie,
      };
      prismaMock.hall.findUnique.mockResolvedValueOnce(DBHall);
      prismaMock.showtime.findMany.mockResolvedValueOnce([existingShowtime]);

      const res = await request(app)
        .get("/api/showtimes/free-slots")
        .query({ date: "2026-06-01"})
        .send({ hallId: helpers.validUUID });

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      for (const slot of res.body) {
        expect(slot.durationMinutes).toBeGreaterThanOrEqual(180);
      }
    });

    it("returns 400 when hallId is missing", async () => {
      const res = await request(app)
        .get("/api/showtimes/free-slots");

      expect(res.status).toBe(400);
    });

    it("returns 404 when hall does not exist", async () => {
      prismaMock.hall.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .get("/api/showtimes/free-slots")
        .send({
          hallId:helpers.validUUID,
        })
      expect(res.status).toBe(404);
    });
  });
});
