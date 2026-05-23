import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app.js";
import { withTestTransaction, adminUser, clientUser } from "@/test/helper";

describe("POST /auth/register", () => {
  it("returns 201 and userDTO on success", async () => {
    await withTestTransaction(async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "New User",
          email: `test${Date.now()}@testing.com`,
          password: "ValidPassword123",
        });

      expect(res.body).toMatchObject({
        response: {
          success: true,
          status: 201,
          message: expect.any(String),
          data: expect.objectContaining({
            id: expect.any(String),
            email: expect.any(String),
          }),
        },
      });
    });
  });

  it("returns 400 if name is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "mojerm@test.com", password: "123456" });

    const {
      response: { success, status },
    } = res.body;

    expect(res.status).toBe(400);
    expect(success).toBe(false);
    expect(status).toBe(400);
  });

  it("returns 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Mojerm", password: "123456" });

    const {
      response: { success, status },
    } = res.body;

    expect(res.status).toBe(400);
    expect(success).toBe(false);
    expect(status).toBe(400);
  });

  it("returns 400 if password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Mojerm", email: "mojerm@test.com" });

    const {
      response: { success, status },
    } = res.body;

    expect(res.status).toBe(400);
    expect(success).toBe(false);
    expect(status).toBe(400);
  });

  it("returns 409 if email already taken", async () => {
    await withTestTransaction(async () => {
      const email = `duplicate${Date.now()}@test.com`;
      const payload = { name: "User One", email, password: "ValidPassword123" };

      const firstRes = await request(app)
        .post("/api/auth/register")
        .send(payload);
      expect(firstRes.status).toBe(201);

      const secondRes = await request(app)
        .post("/api/auth/register")
        .send(payload);
      const {
        response: { success, status },
      } = secondRes.body;

      expect(secondRes.status).toBe(409);
      expect(success).toBe(false);
      expect(status).toBe(409);
    });
  });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe("POST /auth/login", () => {
  it("returns 200 and a token on valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send(adminUser);

    const {
      response: { success, status, data },
    } = res.body;

    expect(res.status).toBe(200);
    expect(success).toBe(true);
    expect(status).toBe(200);
    expect(data).toHaveProperty("accessToken");
    expect(data).toHaveProperty("refreshToken");
    expect(data).toHaveProperty("user");
  });

  it("returns 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "123456" });

    const {
      response: { success, status },
    } = res.body;

    expect(res.status).toBe(400);
    expect(success).toBe(false);
    expect(status).toBe(400);
  });

  it("returns 400 if password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "mojerm@test.com" });

    const {
      response: { success, status },
    } = res.body;

    expect(res.status).toBe(400);
    expect(success).toBe(false);
    expect(status).toBe(400);
  });

  it("returns 400 on wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ ...clientUser, password: "WrongPassword" });

    const {
      response: { success, status },
    } = res.body;

    expect(res.status).toBe(400);
    expect(success).toBe(false);
    expect(status).toBe(400);
  });

  it("returns 404 if user does not exist", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@test.com", password: "123456" });

    const {
      response: { success, status },
    } = res.body;

    expect(res.status).toBe(404);
    expect(success).toBe(false);
    expect(status).toBe(404);
  });
});
