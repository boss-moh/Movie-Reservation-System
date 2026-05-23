import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "@/app.js";
import { getAdminToken, getClientToken, withTestTransaction, invalidID, nonExistentID } from "@/test/helper";
import { CreateHallDTO } from "@/modules/hall/type";

const createHallPayload: CreateHallDTO = {
  name: "Test Hall",
  seatsNumber: 100,
  status: "AVAILABLE",
};

describe("Hall API Endpoints", () => {
  describe("GET /api/halls", () => {
    it("returns 200 and a list of all halls", async () => {
      const res = await request(app).get("/api/halls");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        response: {
          success: true,
          status: 200,
          message: expect.any(String),
        },
      });
      expect(Array.isArray(res.body.response.data)).toBe(true);
    });
  });

  describe("GET /api/halls/:id", () => {
    it("returns 200 and a hall by ID", async () => {
      await withTestTransaction(async () => {
        const createHallRes = await request(app)
          .post("/api/halls")
          .set("Authorization", `Bearer ${await getAdminToken()}`)
          .send(createHallPayload);
        const response = createHallRes.body.response;
        const hallId = response.data.id;

        const res = await request(app).get(`/api/halls/${hallId}`);
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 200,
            message: expect.any(String),
            data: expect.objectContaining({
              id: hallId,
              name: createHallPayload.name,
            }),
          },
        });
      });
    });

    it("returns 404 if hall does not exist", async () => {
      const res = await request(app).get(`/api/halls/${nonExistentID}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });

    it("returns 400 if ID is invalid UUID", async () => {
      const res = await request(app).get(`/api/halls/${invalidID}`);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });
  });

  describe("POST /api/halls (Admin only)", () => {
    it("returns 201 and creates a hall when user is admin", async () => {
      const token = await getAdminToken();

      await withTestTransaction(async () => {
        const res = await request(app)
          .post("/api/halls")
          .set("Authorization", `Bearer ${token}`)
          .send(createHallPayload);

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 201,
            message: expect.any(String),
            data: expect.objectContaining({
              name: createHallPayload.name,
              seatsNumber: createHallPayload.seatsNumber,
            }),
          },
        });
      });
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await getClientToken();

      const res = await request(app)
        .post("/api/halls")
        .set("Authorization", `Bearer ${token}`)
        .send(createHallPayload);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        response: { success: false, status: 403, message: expect.any(String) },
      });
    });

    it("returns 401 when no token is provided", async () => {
      const res = await request(app).post("/api/halls").send(createHallPayload);

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        response: { success: false, status: 401, message: expect.any(String) },
      });
    });

    it("returns 400 on invalid payload", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .post("/api/halls")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "A" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });
  });

  describe("PUT /api/halls/:id (Admin only)", () => {
    it("returns 200 and updates a hall when user is admin", async () => {
      const token = await getAdminToken();

      await withTestTransaction(async () => {
        const createRes = await request(app)
          .post("/api/halls")
          .set("Authorization", `Bearer ${token}`)
          .send(createHallPayload);

        const hallId = createRes.body.response.data.id;

        const res = await request(app)
          .put(`/api/halls/${hallId}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Updated Hall" });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 200,
            message: expect.any(String),
            data: expect.objectContaining({ name: "Updated Hall" }),
          },
        });
      });
    });

    it("returns 404 if hall to update does not exist", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .put(`/api/halls/${nonExistentID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Hall B" });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });

    it("returns 400 if hall ID is invalid", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .put(`/api/halls/${invalidID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Hall B" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await getClientToken();

      await withTestTransaction(async () => {
        const adminToken = await getAdminToken();
        const createRes = await request(app)
          .post("/api/halls")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(createHallPayload);

        const hallId = createRes.body.response.data.id;

        const res = await request(app)
          .put(`/api/halls/${hallId}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Hall B" });

        expect(res.status).toBe(403);
        expect(res.body).toMatchObject({
          response: { success: false, status: 403, message: expect.any(String) },
        });
      });
    });

    it("returns 401 when no token is provided", async () => {
      await withTestTransaction(async () => {
        const adminToken = await getAdminToken();
        const createRes = await request(app)
          .post("/api/halls")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(createHallPayload);

        const hallId = createRes.body.response.data.id;

        const res = await request(app)
          .put(`/api/halls/${hallId}`)
          .send({ name: "Hall B" });

        expect(res.status).toBe(401);
        expect(res.body).toMatchObject({
          response: { success: false, status: 401, message: expect.any(String) },
        });
      });
    });
  });

});