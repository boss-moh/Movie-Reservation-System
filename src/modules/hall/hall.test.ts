import { describe, it, expect } from "vitest";
import request from "supertest";

import { prismaMock } from "@/test";
import { Role } from "@generated/prisma/enums";
import app from "@/app.js";
import { getHashPassword } from "@/utils/getHashPassword";

// Mock Data
const validUUID = "123e4567-e89b-12d3-a456-426614174000";
const invalidUUID = "not-a-uuid";

const clientAdmin = {
  id: "admin-1",
  name: "Admin",
  email: "admin@test.com",
  password: "adminpassword",
};

const DBAdmin = {
  ...clientAdmin,
  role: Role.ADMIN,
  hashPassword: "",
  keyForHashing: "",
  createdAt: new Date(),
  deletedAt: null,
  isDeleted: false,
};

const clientUser = {
  id: "user-1",
  name: "User",
  email: "user@test.com",
  password: "userpassword",
};

const DBUser = {
  ...clientUser,
  role: Role.USER,
  hashPassword: "",
  keyForHashing: "",
  createdAt: new Date(),
  deletedAt: null,
  isDeleted: false,
};

const DBHall = {
  id: validUUID,
  name: "Hall A",
  seatsNumber: 100,
  createdAt: new Date(),
  deletedAt: null,
  isDeleted: false,
};

const createHallPayload = {
  name: "Hall A",
  seatsNumber: 100,
};

// Helper for auth tokens
async function getAuthToken(userClient: typeof clientAdmin | typeof clientUser, userDB: typeof DBAdmin | typeof DBUser) {
  prismaMock.user.findUnique.mockResolvedValueOnce({
    ...userDB,
    hashPassword: await getHashPassword(userClient.password),
  });
  const res = await request(app).post("/api/auth/login").send(userClient);
  return res.body.accessToken;
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
      const res = await request(app).get(`/api/halls/${validUUID}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(validUUID);
    });

    it("returns 404 if hall does not exist", async () => {
      prismaMock.hall.findUnique.mockResolvedValueOnce(null);
      const res = await request(app).get(`/api/halls/${validUUID}`);
      expect(res.status).toBe(404);
    });

    it("returns 400 if ID is invalid UUID", async () => {
      const res = await request(app).get(`/api/halls/${invalidUUID}`);
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/halls (Admin only)", () => {
    it("returns 201 and creates a hall when user is admin", async () => {
      const token = await getAuthToken(clientAdmin, DBAdmin);
      prismaMock.hall.create.mockResolvedValueOnce(DBHall);

      const res = await request(app)
        .post("/api/halls")
        .set("Authorization", `Bearer ${token}`)
        .send(createHallPayload);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe(createHallPayload.name);
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await getAuthToken(clientUser, DBUser);

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
      const token = await getAuthToken(clientAdmin, DBAdmin);

      const res = await request(app)
        .post("/api/halls")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "A" }); // Name too short

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/halls/:id (Admin only)", () => {
    it("returns 200 and updates a hall when user is admin", async () => {
      const token = await getAuthToken(clientAdmin, DBAdmin);
      prismaMock.hall.findUnique.mockResolvedValueOnce(DBHall);
      prismaMock.hall.update.mockResolvedValueOnce({
        ...DBHall,
        name: "Hall B",
      });

      const res = await request(app)
        .put(`/api/halls/${validUUID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Hall B" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Hall B");
    });

    it("returns 404 if hall to update does not exist", async () => {
      const token = await getAuthToken(clientAdmin, DBAdmin);
      prismaMock.hall.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/api/halls/${validUUID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Hall B" });

      expect(res.status).toBe(404);
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await getAuthToken(clientUser, DBUser);

      const res = await request(app)
        .put(`/api/halls/${validUUID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Hall B" });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/halls/:id (Admin only)", () => {
    it("returns 200 and deletes a hall when user is admin", async () => {
      const token = await getAuthToken(clientAdmin, DBAdmin);
      prismaMock.hall.findUnique.mockResolvedValueOnce(DBHall);
      prismaMock.hall.update.mockResolvedValueOnce(DBHall);

      const res = await request(app)
        .delete(`/api/halls/${validUUID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Hall deleted successfully");
    });

    it("returns 404 if hall to delete does not exist", async () => {
      const token = await getAuthToken(clientAdmin, DBAdmin);
      prismaMock.hall.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete(`/api/halls/${validUUID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await getAuthToken(clientUser, DBUser);

      const res = await request(app)
        .delete(`/api/halls/${validUUID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/halls/:id/restore (Admin only)", () => {
    it("returns 200 and restores a hall when user is admin", async () => {
      const token = await getAuthToken(clientAdmin, DBAdmin);
      prismaMock.hall.findUnique.mockResolvedValueOnce(DBHall);
      prismaMock.hall.update.mockResolvedValueOnce(DBHall);

      const res = await request(app)
        .put(`/api/halls/${validUUID}/restore`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Hall restored successfully");
    });

    it("returns 404 if hall to restore does not exist", async () => {
      const token = await getAuthToken(clientAdmin, DBAdmin);
      prismaMock.hall.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/api/halls/${validUUID}/restore`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await getAuthToken(clientUser, DBUser);

      const res = await request(app)
        .put(`/api/halls/${validUUID}/restore`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});
