import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app.js";
import {
  getAdminToken,
  withTestTransaction,
  invalidID,
  nonExistentID,
} from "@/test/helper";

describe("Seat API Endpoints", () => {
  describe("GET /api/seats", () => {
    it("returns 200 and a list of all seats", async () => {
      const res = await request(app).get("/api/seats");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        response: { success: true, status: 200, message: expect.any(String) },
      });
      expect(Array.isArray(res.body.response.data)).toBe(true);
    });
  });

  describe("GET /api/seats/hall/:id", () => {
    it("returns 200 and seats for a specific hall", async () => {
      await withTestTransaction(async () => {
        const adminToken = await getAdminToken();
        const hallRes = await request(app)
          .post("/api/halls")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ name: "Test Hall", seatsNumber: 50 });

        const hallId = hallRes.body.response.data.id;

        const res = await request(app).get(`/api/seats/hall/${hallId}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: { success: true, status: 200, message: expect.any(String) },
        });
        expect(Array.isArray(res.body.response.data)).toBe(true);
      });
    });

    it("returns 404 for non-existent hall", async () => {
      const res = await request(app).get(`/api/seats/hall/${nonExistentID}`);

      expect(res.status).toBe(404);
      expect(res.body.response.success).toBe(false);
    });

    it("returns 400 for invalid hall ID", async () => {
      const res = await request(app).get(`/api/seats/hall/${invalidID}`);

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/seats/:seatId", () => {
    it("returns 200 and a seat by ID", async () => {
      await withTestTransaction(async () => {
        const adminToken = await getAdminToken();

        const hallRes = await request(app)
          .post("/api/halls")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ name: "Test Hall", seatsNumber: 50 });

        const seatId = hallRes.body.response.data.seats[0].id;

        const res = await request(app).get(`/api/seats/${seatId}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: { success: true, status: 200, message: expect.any(String) },
        });
        expect(res.body.response.data.id).toBe(seatId);
      });
    });

    it("returns 404 for non-existent seat", async () => {
      const res = await request(app).get(`/api/seats/${nonExistentID}`);

      expect(res.status).toBe(404);
      expect(res.body.response.success).toBe(false);
    });

    it("returns 400 for invalid seat ID", async () => {
      const res = await request(app).get(`/api/seats/${invalidID}`);

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/seats", () => {
    it("returns 201 and creates a new seat", async () => {
      await withTestTransaction(async () => {
        const adminToken = await getAdminToken();

        const hallRes = await request(app)
          .post("/api/halls")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ name: "Test Hall", seatsNumber: 50 });

        const hallId = hallRes.body.response.data.id;

        const res = await request(app)
          .post("/api/seats")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ hallId, type: "VIP" });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 201,
            message: "Seat created successfully",
            data: { hallId, type: "VIP" },
          },
        });
      });
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app)
        .post("/api/seats")
        .send({ hallId: "some-id", type: "STANDARD" });

      expect(res.status).toBe(401);
    });

    it("returns 400 for missing hallId", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .post("/api/seats")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ type: "STANDARD" });

      expect(res.status).toBe(400);
    });

    it("returns 404 for non-existent hall", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .post("/api/seats")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ hallId: nonExistentID, type: "STANDARD" });

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/seats/:seatId", () => {
    it("returns 200 and updates a seat", async () => {
      await withTestTransaction(async () => {
        const adminToken = await getAdminToken();

        const hallRes = await request(app)
          .post("/api/halls")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ name: "Test Hall", seatsNumber: 50 });

        const seatId = hallRes.body.response.data.seats[0].id;

        const res = await request(app)
          .put(`/api/seats/${seatId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ type: "VIP" });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 200,
            message: "Seat updated successfully",
            data: { type: "VIP" },
          },
        });
      });
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app)
        .put(`/api/seats/${nonExistentID}`)
        .send({ type: "VIP" });

      expect(res.status).toBe(401);
    });

    it("returns 404 for non-existent seat", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .put(`/api/seats/${nonExistentID}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ type: "VIP" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/seats/:seatId", () => {
    it("returns 200 and deletes a seat", async () => {
      await withTestTransaction(async () => {
        const adminToken = await getAdminToken();

        const hallRes = await request(app)
          .post("/api/halls")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ name: "Test Hall", seatsNumber: 50 });

        const seatId = hallRes.body.response.data.seats[0].id;

        const res = await request(app)
          .delete(`/api/seats/${seatId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 200,
            message: "Seat deleted successfully",
          },
        });
      });
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).delete(`/api/seats/${nonExistentID}`);

      expect(res.status).toBe(401);
    });

    it("returns 404 for non-existent seat", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .delete(`/api/seats/${nonExistentID}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/seats/:seatId/restore", () => {
    it("returns 200 and restores a deleted seat", async () => {
      await withTestTransaction(async () => {
        const adminToken = await getAdminToken();

        const hallRes = await request(app)
          .post("/api/halls")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ name: "Test Hall", seatsNumber: 50 });

        const seatId = hallRes.body.response.data.seats[0].id;

        // Delete the seat first
        await request(app)
          .delete(`/api/seats/${seatId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        // Restore the seat
        const res = await request(app)
          .put(`/api/seats/${seatId}/restore`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 200,
            message: "Seat restored successfully",
          },
        });
      });
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).put(`/api/seats/${nonExistentID}/restore`);

      expect(res.status).toBe(401);
    });

    it("returns 404 for non-existent seat", async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .put(`/api/seats/${nonExistentID}/restore`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
