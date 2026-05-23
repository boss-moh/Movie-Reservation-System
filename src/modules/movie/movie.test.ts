import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app.js";
import { getAdminToken, getClientToken, withTestTransaction, invalidID, nonExistentID } from "@/test/helper";

const createMoviePayload = {
  title: "Test Movie",
  durationMinutes: 148,
  genre: "Sci-Fi",
  description: "A test movie",
  posterUrl: "http://example.com/movie.jpg",
};

describe("Movie API Endpoints", () => {
  describe("GET /api/movies", () => {
    it("returns 200 and a list of all movies", async () => {
      const res = await request(app).get("/api/movies");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        response: { success: true, status: 200, message: expect.any(String) },
      });
      expect(Array.isArray(res.body.response.data)).toBe(true);
    });
  });

  describe("GET /api/movies/:id", () => {
    it("returns 200 and a movie by ID", async () => {
      await withTestTransaction(async () => {
        const createRes = await request(app)
          .post("/api/movies")
          .set("Authorization", `Bearer ${await getAdminToken()}`)
          .send(createMoviePayload);

        const movieId = createRes.body.response.data.id;

        const res = await request(app).get(`/api/movies/${movieId}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 200,
            message: expect.any(String),
            data: expect.objectContaining({
              id: movieId,
              title: createMoviePayload.title,
            }),
          },
        });
      });
    });

    it("returns 404 if movie does not exist", async () => {
      const res = await request(app).get(`/api/movies/${nonExistentID}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });

    it("returns 400 if ID is invalid UUID", async () => {
      const res = await request(app).get(`/api/movies/${invalidID}`);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });
  });

  describe("POST /api/movies (Admin only)", () => {
    it("returns 201 and creates a movie when user is admin", async () => {
      const token = await getAdminToken();

      await withTestTransaction(async () => {
        const res = await request(app)
          .post("/api/movies")
          .set("Authorization", `Bearer ${token}`)
          .send(createMoviePayload);

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 201,
            message: expect.any(String),
            data: expect.objectContaining({
              title: createMoviePayload.title,
              durationMinutes: createMoviePayload.durationMinutes,
            }),
          },
        });
      });
    });

    it("returns 403 when user is not an admin", async () => {
      const token = await getClientToken();

      const res = await request(app)
        .post("/api/movies")
        .set("Authorization", `Bearer ${token}`)
        .send(createMoviePayload);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        response: { success: false, status: 403, message: expect.any(String) },
      });
    });

    it("returns 401 when no token is provided", async () => {
      const res = await request(app).post("/api/movies").send(createMoviePayload);

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        response: { success: false, status: 401, message: expect.any(String) },
      });
    });

    it("returns 400 on invalid payload", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .post("/api/movies")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "A" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });
  });

  describe("PUT /api/movies/:id (Admin only)", () => {
    it("returns 200 and updates a movie when user is admin", async () => {
      const token = await getAdminToken();

      await withTestTransaction(async () => {
        const createRes = await request(app)
          .post("/api/movies")
          .set("Authorization", `Bearer ${token}`)
          .send(createMoviePayload);

        const movieId = createRes.body.response.data.id;

        const res = await request(app)
          .put(`/api/movies/${movieId}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ title: "Updated Movie" });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: {
            success: true,
            status: 200,
            message: expect.any(String),
            data: expect.objectContaining({ title: "Updated Movie" }),
          },
        });
      });
    });

    it("returns 404 if movie to update does not exist", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .put(`/api/movies/${nonExistentID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated" });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });

    it("returns 400 if movie ID is invalid", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .put(`/api/movies/${invalidID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });

    it("returns 403 when user is not an admin", async () => {
      const clientToken = await getClientToken();

      await withTestTransaction(async () => {
        const adminToken = await getAdminToken();
        const createRes = await request(app)
          .post("/api/movies")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(createMoviePayload);

        const movieId = createRes.body.response.data.id;

        const res = await request(app)
          .put(`/api/movies/${movieId}`)
          .set("Authorization", `Bearer ${clientToken}`)
          .send({ title: "Updated" });

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
          .post("/api/movies")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(createMoviePayload);

        const movieId = createRes.body.response.data.id;

        const res = await request(app)
          .put(`/api/movies/${movieId}`)
          .send({ title: "Updated" });

        expect(res.status).toBe(401);
        expect(res.body).toMatchObject({
          response: { success: false, status: 401, message: expect.any(String) },
        });
      });
    });
  });

  describe("DELETE /api/movies/:id (Admin only)", () => {
    it("returns 200 and deletes a movie when user is admin", async () => {
      const token = await getAdminToken();

      await withTestTransaction(async () => {
        const createRes = await request(app)
          .post("/api/movies")
          .set("Authorization", `Bearer ${token}`)
          .send(createMoviePayload);

        const movieId = createRes.body.response.data.id;

        const res = await request(app)
          .delete(`/api/movies/${movieId}`)
          .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: { success: true, status: 200, message: expect.any(String) },
        });
      });
    });

    it("returns 404 if movie to delete does not exist", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .delete(`/api/movies/${nonExistentID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });

    it("returns 400 if movie ID is invalid", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .delete(`/api/movies/${invalidID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });

    it("returns 403 when user is not an admin", async () => {
      const clientToken = await getClientToken();

      await withTestTransaction(async () => {
        const adminToken = await getAdminToken();
        const createRes = await request(app)
          .post("/api/movies")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(createMoviePayload);

        const movieId = createRes.body.response.data.id;

        const res = await request(app)
          .delete(`/api/movies/${movieId}`)
          .set("Authorization", `Bearer ${clientToken}`);

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
          .post("/api/movies")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(createMoviePayload);

        const movieId = createRes.body.response.data.id;

        const res = await request(app).delete(`/api/movies/${movieId}`);

        expect(res.status).toBe(401);
        expect(res.body).toMatchObject({
          response: { success: false, status: 401, message: expect.any(String) },
        });
      });
    });
  });

  describe("PUT /api/movies/:id/restore (Admin only)", () => {
    it("returns 200 and restores a movie when user is admin", async () => {
      const token = await getAdminToken();

      await withTestTransaction(async () => {
        const createRes = await request(app)
          .post("/api/movies")
          .set("Authorization", `Bearer ${token}`)
          .send(createMoviePayload);

        const movieId = createRes.body.response.data.id;

        await request(app)
          .delete(`/api/movies/${movieId}`)
          .set("Authorization", `Bearer ${token}`);

        const res = await request(app)
          .put(`/api/movies/${movieId}/restore`)
          .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          response: { success: true, status: 200, message: expect.any(String) },
        });
      });
    });

    it("returns 404 if movie to restore does not exist", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .put(`/api/movies/${nonExistentID}/restore`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });

    it("returns 400 if movie ID is invalid", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .put(`/api/movies/${invalidID}/restore`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });

    it("returns 403 when user is not an admin", async () => {
      const clientToken = await getClientToken();

      const res = await request(app)
        .put(`/api/movies/${nonExistentID}/restore`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        response: { success: false, status: 403, message: expect.any(String) },
      });
    });

    it("returns 401 when no token is provided", async () => {
      const res = await request(app).put(`/api/movies/${nonExistentID}/restore`);

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        response: { success: false, status: 401, message: expect.any(String) },
      });
    });
  });
});