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
};

const DBMovie = {
  id: validUUID,
  title: "Inception",
  durationMinutes: 148,
  genre: "Sci-Fi",
  description: "A thief who steals corporate secrets...",
  posterUrl: "http://example.com/inception.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createMoviePayload = {
  title: "Inception",
  durationMinutes: 148,
  genre: "Sci-Fi",
  description: "A thief who steals corporate secrets...",
  posterUrl: "http://example.com/inception.jpg",
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

describe("Movie API Endpoints", () => {
  describe("GET /api/movies", () => {
    it("returns 200 and a list of all movies", async () => {
      prismaMock.movie.findMany.mockResolvedValueOnce([DBMovie]);
      const res = await request(app).get("/api/movies");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe(DBMovie.title);
    });

    it.todo("supports filtering via ?date=YYYY-MM-DD and ?genre= filters");
  });

  describe("GET /api/movies/:id", () => {
    it("returns 200 and a movie by ID", async () => {
      prismaMock.movie.findUnique.mockResolvedValueOnce(DBMovie);
      const res = await request(app).get(`/api/movies/${validUUID}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(validUUID);
    });

    it("returns 404 if movie does not exist", async () => {
      prismaMock.movie.findUnique.mockResolvedValueOnce(null);
      const res = await request(app).get(`/api/movies/${validUUID}`);
      expect(res.status).toBe(404);
    });

    it("returns 400 if ID is invalid UUID", async () => {
      const res = await request(app).get(`/api/movies/${invalidUUID}`);
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/movies/:id/showtimes", () => {
    it.todo("returns 200 and showtimes for a movie by ID");
    it.todo("supports filtering via ?date= filter");
  });

  describe("POST /api/movies (Admin only)", () => {
    it("returns 201 and creates a movie when user is admin", async () => {
      const token = await getAuthToken(clientAdmin, DBAdmin);
      prismaMock.movie.create.mockResolvedValueOnce(DBMovie);

      const res = await request(app)
        .post("/api/movies")
        .set("Authorization", `Bearer ${token}`)
        .send(createMoviePayload);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe(createMoviePayload.title);
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await getAuthToken(clientUser, DBUser);

      const res = await request(app)
        .post("/api/movies")
        .set("Authorization", `Bearer ${token}`)
        .send(createMoviePayload);

      expect(res.status).toBe(403);
    });

    it("returns 401 when no token is provided", async () => {
      const res = await request(app).post("/api/movies").send(createMoviePayload);
      expect(res.status).toBe(401);
    });

    it("returns 400 on invalid payload", async () => {
      const token = await getAuthToken(clientAdmin, DBAdmin);

      const res = await request(app)
        .post("/api/movies")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "A" }); // Title too short

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/movies/:id (Admin only)", () => {
    it("returns 200 and updates a movie when user is admin", async () => {
      const token = await getAuthToken(clientAdmin, DBAdmin);
      prismaMock.movie.findUnique.mockResolvedValueOnce(DBMovie);
      prismaMock.movie.update.mockResolvedValueOnce({
        ...DBMovie,
        title: "Inception 2",
      });

      const res = await request(app)
        .put(`/api/movies/${validUUID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Inception 2" });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Inception 2");
    });

    it("returns 404 if movie to update does not exist", async () => {
      const token = await getAuthToken(clientAdmin, DBAdmin);
      prismaMock.movie.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/api/movies/${validUUID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Inception 2" });

      expect(res.status).toBe(404);
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await getAuthToken(clientUser, DBUser);

      const res = await request(app)
        .put(`/api/movies/${validUUID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Inception 2" });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/movies/:id (Admin only)", () => {
    it("returns 200 and deletes a movie when user is admin", async () => {
      const token = await getAuthToken(clientAdmin, DBAdmin);
      prismaMock.movie.findUnique.mockResolvedValueOnce(DBMovie);
      prismaMock.movie.delete.mockResolvedValueOnce(DBMovie as any);

      const res = await request(app)
        .delete(`/api/movies/${validUUID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await getAuthToken(clientUser, DBUser);

      const res = await request(app)
        .delete(`/api/movies/${validUUID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});
