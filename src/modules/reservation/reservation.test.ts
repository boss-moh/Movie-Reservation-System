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

const createMoviePayload = {
  title: "Reservation Test Movie",
  durationMinutes: 120,
  genre: "Drama",
  description: "A movie used by reservation tests",
  posterUrl: "http://example.com/movie.jpg",
};

describe("Reservation API Endpoints", () => {
  const createReservationData = async (adminToken: string) => {
    const hallRes = await request(app)
      .post("/api/halls")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Reservation Hall", seatsNumber: 10, status: "AVAILABLE" });

    const movieRes = await request(app)
      .post("/api/movies")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(createMoviePayload);

    const hallId = hallRes.body.response.data.id;
    const movieId = movieRes.body.response.data.id;
    const seatIds = hallRes.body.response.data.seats.slice(0, 2).map((seat: { id: string }) => seat.id);

    const showtimeRes = await request(app)
      .post("/api/showtimes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        movieId,
        hallId,
        startTime: new Date(Date.now() + 1000 * 60 * 120),
        priceForSeat: 15.0,
      });

    const showtimeId = showtimeRes.body.response.data.id;

    return { hallId, movieId, showtimeId, seatIds };
  };

  describe("POST /api/reservations", () => {
    it("creates a reservation successfully for an authenticated client", async () => {
      const adminToken = await getAdminToken();
      const clientToken = await getClientToken();

      await withTestTransaction(async () => {
        const { showtimeId, seatIds } = await createReservationData(adminToken);

        const res = await request(app)
          .post("/api/reservations")
          .set("Authorization", `Bearer ${clientToken}`)
          .send({ showtimeId, seatIds });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 201,
            message: expect.any(String),
            data: expect.objectContaining({ showtimeId, totalPrice: 30.0 }),
          },
        });
      });
    });

    it("returns 401 when no token is provided", async () => {
      const res = await request(app)
        .post("/api/reservations")
        .send({ showtimeId: nonExistentID, seatIds: [invalidID] });

      expect(res.status).toBe(401);
      expect(res.body.response.success).toBe(false);
    });

    it("returns 400 for invalid payload", async () => {
      const clientToken = await getClientToken();

      const res = await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ showtimeId: "not-a-uuid", seatIds: [] });

      expect(res.status).toBe(400);
      expect(res.body.response.success).toBe(false);
    });
  });

  describe("GET /api/reservations", () => {
    it("returns reservations for the authenticated user", async () => {
      const adminToken = await getAdminToken();
      const clientToken = await getClientToken();

      await withTestTransaction(async () => {
        const { showtimeId, seatIds } = await createReservationData(adminToken);

        await request(app)
          .post("/api/reservations")
          .set("Authorization", `Bearer ${clientToken}`)
          .send({ showtimeId, seatIds });

        const res = await request(app)
          .get("/api/reservations")
          .set("Authorization", `Bearer ${clientToken}`);

        expect(res.status).toBe(200);
        expect(res.body.response.success).toBe(true);
        expect(Array.isArray(res.body.response.data)).toBe(true);
        expect(res.body.response.data.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("returns 401 when unauthorized", async () => {
      const res = await request(app).get("/api/reservations");

      expect(res.status).toBe(401);
      expect(res.body.response.success).toBe(false);
    });
  });

  describe("GET /api/reservations/:id", () => {
    it("returns a reservation by id", async () => {
      const adminToken = await getAdminToken();
      const clientToken = await getClientToken();

      await withTestTransaction(async () => {
        const { showtimeId, seatIds } = await createReservationData(adminToken);

        const createRes = await request(app)
          .post("/api/reservations")
          .set("Authorization", `Bearer ${clientToken}`)
          .send({ showtimeId, seatIds });

        const reservationId = createRes.body.response.data.id;

        const res = await request(app)
          .get(`/api/reservations/${reservationId}`)
          .set("Authorization", `Bearer ${clientToken}`);

        expect(res.status).toBe(200);
        expect(res.body.response.data.id).toBe(reservationId);
      });
    });

    it("returns 404 for non-existent reservation", async () => {
      const clientToken = await getClientToken();

      const res = await request(app)
        .get(`/api/reservations/${nonExistentID}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(404);
      expect(res.body.response.success).toBe(false);
    });

    it("returns 400 for invalid reservation id", async () => {
      const clientToken = await getClientToken();

      const res = await request(app)
        .get(`/api/reservations/${invalidID}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(400);
      expect(res.body.response.success).toBe(false);
    });
  });

  describe("DELETE /api/reservations/:id", () => {
    it("cancels a reservation successfully", async () => {
      const adminToken = await getAdminToken();
      const clientToken = await getClientToken();

      await withTestTransaction(async () => {
        const { showtimeId, seatIds } = await createReservationData(adminToken);

        const createRes = await request(app)
          .post("/api/reservations")
          .set("Authorization", `Bearer ${clientToken}`)
          .send({ showtimeId, seatIds });

        const reservationId = createRes.body.response.data.id;

        const res = await request(app)
          .delete(`/api/reservations/${reservationId}`)
          .set("Authorization", `Bearer ${clientToken}`);

        expect(res.status).toBe(200);
        expect(res.body.response.data.status).toBe("CANCELLED");
      });
    });

    it("returns 404 when cancelling a non-existent reservation", async () => {
      const clientToken = await getClientToken();

      const res = await request(app)
        .delete(`/api/reservations/${nonExistentID}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(404);
      expect(res.body.response.success).toBe(false);
    });

    it("returns 400 for invalid reservation id", async () => {
      const clientToken = await getClientToken();

      const res = await request(app)
        .delete(`/api/reservations/${invalidID}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(400);
      expect(res.body.response.success).toBe(false);
    });
  });
});
