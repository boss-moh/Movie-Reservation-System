import { describe, it, expect } from "vitest";

import request from "supertest";

import app from "@/app.js";
import { prismaMock } from "@/test";
import { Hall } from "@generated/prisma/client";


import { helpers } from "@/test/helper";
import { CreateHallDTO } from "@/modules/hall/type";


const createHallPayload: CreateHallDTO = {
  name: "Hall A",
  seatsNumber: 100,
  status: "AVAILABLE",

};

const DBHall: Hall = {
  ...createHallPayload,
  id: helpers.validUUID,
  status: "AVAILABLE",

}



describe("Hall API Endpoints", () => {
  describe("GET /api/halls", () => {
    it("returns 200 and a list of all halls", async () => {
      prismaMock.hall.findMany.mockResolvedValueOnce([DBHall]);
      const res = await request(app).get("/api/halls");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe(DBHall.name);
    });
  });

  describe("GET /api/halls/:id", () => {
    it("returns 200 and a hall by ID", async () => {
      prismaMock.hall.findUnique.mockResolvedValueOnce(DBHall);
      const res = await request(app).get(`/api/halls/${helpers.validUUID}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(helpers.validUUID);
    });

    it("returns 404 if hall does not exist", async () => {
      prismaMock.hall.findUnique.mockResolvedValueOnce(null);
      const res = await request(app).get(`/api/halls/${helpers.validUUID}`);
      expect(res.status).toBe(404);
    });

    it("returns 400 if ID is invalid UUID", async () => {
      const res = await request(app).get(`/api/halls/${helpers.invalidUUID}`);
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/halls (Admin only)", () => {
    it("returns 201 and creates a hall when user is admin", async () => {
      const token = await helpers.getTokenAdmin();
      prismaMock.hall.create.mockResolvedValueOnce(DBHall);

      const res = await request(app)
        .post("/api/halls")
        .set("Authorization", `Bearer ${token}`)
        .send(createHallPayload);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe(createHallPayload.name);
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await helpers.getTokenUser();

      const res = await request(app)
        .post("/api/halls")
        .set("Authorization", `Bearer ${token}`)
        .send(createHallPayload);

      expect(res.status).toBe(403);
    });

    it("returns 401 when no token is provided", async () => {
      const res = await request(app).post("/api/halls").send(createHallPayload);
      expect(res.status).toBe(401);
    });

    it("returns 400 on invalid payload", async () => {
      const token = await helpers.getTokenAdmin();

      const res = await request(app)
        .post("/api/halls")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "A" }); // Name too short

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/halls/:id (Admin only)", () => {
    it("returns 200 and updates a hall when user is admin", async () => {
      const token = await helpers.getTokenAdmin();
      prismaMock.hall.findUnique.mockResolvedValueOnce(DBHall);
      prismaMock.hall.update.mockResolvedValueOnce({
        ...DBHall,
        name: "Hall B",
      });

      const res = await request(app)
        .put(`/api/halls/${helpers.validUUID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Hall B" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Hall B");
    });

    it("returns 404 if hall to update does not exist", async () => {
      const token = await helpers.getTokenAdmin();
      prismaMock.hall.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/api/halls/${helpers.validUUID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Hall B" });

      expect(res.status).toBe(404);
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await helpers.getTokenUser();

      const res = await request(app)
        .put(`/api/halls/${helpers.validUUID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Hall B" });

      expect(res.status).toBe(403);
    });
  });

});
