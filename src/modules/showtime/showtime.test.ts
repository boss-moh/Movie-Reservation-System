import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app.js";
import {
  getAdminToken,
  getClientToken,
  withTestTransaction,
  invalidID,
  nonExistentID,
} from "@/test/helper";
import { CreateShowtimeDTO } from "@/modules/showtime/type";

const createShowtimePayload: CreateShowtimeDTO = {
  movieId: "123e4567-e89b-12d3-a456-426614174000",
  hallId: "123e4567-e89b-12d3-a456-426614174001",
  startTime: new Date("2026-06-01T18:00:00Z"),
  priceForSeat: 12.5,
};

const createMoviePayload = {
      title: "Test Movie",
      durationMinutes: 148,
      genre: "Sci-Fi",
      description: "A test movie",
      posterUrl: "http://example.com/movie.jpg",
    }

const createHallAndMovie = async (adminToken: string) => {
  const hallRes = await request(app)
    .post("/api/halls")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: "Test Hall", seatsNumber: 50, status: "AVAILABLE" });

  const movieRes = await request(app)
    .post("/api/movies")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(createMoviePayload);


  return {
    hallId: hallRes.body.response.data.id,
    movieId: movieRes.body.response.data.id,
  };
};

describe("Showtime API Endpoints", () => {
  describe("GET /api/showtimes", () => {
    it("returns 200 and a list of all showtimes", async () => {
      const res = await request(app).get("/api/showtimes");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        response: { success: true, status: 200, message: expect.any(String) },
      });
      expect(Array.isArray(res.body.response.data)).toBe(true);
    });
  });

  describe("GET /api/showtimes/:id", () => {
    it("returns 200 and a showtime by ID", async () => {
      await withTestTransaction(async () => {
        const adminToken = await getAdminToken();
        const { hallId, movieId } = await createHallAndMovie(adminToken);

        const createRes = await request(app)
          .post("/api/showtimes")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId,
            hallId,
            startTime: new Date("2026-06-01T18:00:00Z"),
            priceForSeat: 12.5,
          });

        const showtimeId = createRes.body.response.data.id;

        const res = await request(app).get(`/api/showtimes/${showtimeId}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 200,
            message: expect.any(String),
            data: expect.objectContaining({ id: showtimeId }),
          },
        });
      });
    });

    it("returns 404 if showtime does not exist", async () => {
      const res = await request(app).get(`/api/showtimes/${nonExistentID}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });

    it("returns 400 if showtime ID is invalid", async () => {
      const res = await request(app).get(`/api/showtimes/${invalidID}`);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });
  });

  describe("POST /api/showtimes (Admin only)", () => {
    it("returns 201 and creates a showtime when user is admin", async () => {
      const adminToken = await getAdminToken();

      await withTestTransaction(async () => {
        const { hallId, movieId } = await createHallAndMovie(adminToken);

        const res = await request(app)
          .post("/api/showtimes")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId,
            hallId,
            startTime: new Date("2026-06-01T18:00:00Z"),
            priceForSeat: 12.5,
          });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 201,
            message: expect.any(String),
            data: expect.objectContaining({ movieId }),
          },
        });
      });
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await getClientToken();

      const res = await request(app)
        .post("/api/showtimes")
        .set("Authorization", `Bearer ${token}`)
        .send(createShowtimePayload);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        response: { success: false, status: 403, message: expect.any(String) },
      });
    });

    it("returns 401 when no token is provided", async () => {
      const res = await request(app)
        .post("/api/showtimes")
        .send(createShowtimePayload);

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        response: { success: false, status: 401, message: expect.any(String) },
      });
    });

    it("returns 400 on invalid payload", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .post("/api/showtimes")
        .set("Authorization", `Bearer ${token}`)
        .send({ movieId: "test" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });
  });

  describe("PUT /api/showtimes/:id (Admin only)", () => {
    it("returns 200 and updates a showtime when user is admin", async () => {
      const adminToken = await getAdminToken();

      await withTestTransaction(async () => {
        const { hallId, movieId } = await createHallAndMovie(adminToken);

        const createRes = await request(app)
          .post("/api/showtimes")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId,
            hallId,
            startTime: new Date("2026-06-01T18:00:00Z"),
            priceForSeat: 12.5,
          });

        const showtimeId = createRes.body.response.data.id;

        const res = await request(app)
          .put(`/api/showtimes/${showtimeId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ priceForSeat: 15.0 });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 200,
            message: expect.any(String),
            data: expect.objectContaining({ priceForSeat: 15.0 }),
          },
        });
      });
    });

    it("returns 404 if showtime to update does not exist", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .put(`/api/showtimes/${nonExistentID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ priceForSeat: 15.0 });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });

    it("returns 400 if showtime ID is invalid", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .put(`/api/showtimes/${invalidID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ priceForSeat: 15.0 });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });

    it("returns 403 when user is not an admin", async () => {
      const clientToken = await getClientToken();

      const res = await request(app)
        .put(`/api/showtimes/${nonExistentID}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ priceForSeat: 15.0 });

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        response: { success: false, status: 403, message: expect.any(String) },
      });
    });

    it("returns 401 when no token is provided", async () => {
      const res = await request(app)
        .put(`/api/showtimes/${nonExistentID}`)
        .send({ priceForSeat: 15.0 });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        response: { success: false, status: 401, message: expect.any(String) },
      });
    });
  });

  describe("DELETE /api/showtimes/:id (Admin only)", () => {
    it("returns 200 and soft deletes a showtime", async () => {
      const adminToken = await getAdminToken();

      await withTestTransaction(async () => {
        const { hallId, movieId } = await createHallAndMovie(adminToken);

        const createRes = await request(app)
          .post("/api/showtimes")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId,
            hallId,
            startTime: new Date("2026-06-01T18:00:00Z"),
            priceForSeat: 12.5,
          });

        const showtimeId = createRes.body.response.data.id;

        const res = await request(app)
          .delete(`/api/showtimes/${showtimeId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: { success: true, status: 200, message: expect.any(String) },
        });
      });
    });

    it("returns 404 if showtime to delete does not exist", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .delete(`/api/showtimes/${nonExistentID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });

    it("returns 400 if showtime ID is invalid", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .delete(`/api/showtimes/${invalidID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });

    it("returns 403 when user is not an admin", async () => {
      const clientToken = await getClientToken();

      const res = await request(app)
        .delete(`/api/showtimes/${nonExistentID}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        response: { success: false, status: 403, message: expect.any(String) },
      });
    });

    it("returns 401 when no token is provided", async () => {
      const res = await request(app).delete(`/api/showtimes/${nonExistentID}`);

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        response: { success: false, status: 401, message: expect.any(String) },
      });
    });
  });

  describe("GET /api/showtimes/free-slots", () => {
    it("returns 200 and free slots for a hall", async () => {
      await withTestTransaction(async () => {
        const adminToken = await getAdminToken();

        const hallRes = await request(app)
          .post("/api/halls")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ name: "Test Hall", seatsNumber: 50, status: "AVAILABLE" });

        const hallId = hallRes.body.response.data.id;

        const res = await request(app)
          .get("/api/showtimes/free-slots")
          .send({ date: "2026-06-01", hallId });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: { success: true, status: 200, message: expect.any(String) },
        });
        expect(Array.isArray(res.body.response.data)).toBe(true);
      });
    });

    it("returns 400 when hallId is missing", async () => {
      const res = await request(app)
        .get("/api/showtimes/free-slots")
        .send({ date: "2026-06-01" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });

    it("returns 404 when hall does not exist", async () => {
      const res = await request(app)
        .get("/api/showtimes/free-slots")
        .send({ date: "2026-06-01", hallId: nonExistentID });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });

    it("returns 400 when hallId is invalid", async () => {
      const res = await request(app)
        .get("/api/showtimes/free-slots")
        .send({ date: "2026-06-01", hallId: invalidID });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });


  });
});
