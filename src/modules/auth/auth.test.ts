import { describe, it, expect } from "vitest";
import request from "supertest";

import { prismaMock } from "@/test";

import { Role } from "@generated/prisma/enums";
import app from "@/app.js";
import { getHashPassword } from "@/utils/getHashPassword";


const clientUser = {
  id: "dc988870-29a1-4210-a742-6171ff40d1e9",
  name: "testing client",
  email: "test@testing.com",
  password: "12345678",
};

const DBUser = {
  ...clientUser,
  role: Role.USER,
  hashPassword: "",
  keyForHashing: "",
  createdAt: new Date(),
  isDeleted: false,
  deletedAt: null,
};



describe("POST /auth/register", () => {
  it("returns 201 and userDTO on success ", async () => {
    prismaMock.user.create.mockResolvedValue(DBUser);
    const res = await request(app).post("/api/auth/register").send(clientUser);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ email: clientUser.email });
    expect(res.body).not.toHaveProperty("hashPassword");
    expect(res.body).not.toHaveProperty("keyForHashing");
  });

  it("returns 400 if name is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "mojerm@test.com", password: "123456" });

    expect(res.status).toBe(400);
  });

  it("returns 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Mojerm", password: "123456" });

    expect(res.status).toBe(400);
  });

  it("returns 400 if password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Mojerm", email: "mojerm@test.com" });

    expect(res.status).toBe(400);
  });

  it("returns 409 if email already taken", async () => {
    // First registration: user doesn't exist yet, so create succeeds
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce(DBUser);

    const firstClient = await request(app)
      .post("/api/auth/register")
      .send(clientUser);

    expect(firstClient.status).toBe(201);

    // Second registration: user already exists, so findUnique returns existing user
    prismaMock.user.findUnique.mockResolvedValueOnce(DBUser);

    const secondClient = await request(app)
      .post("/api/auth/register")
      .send(clientUser);

    expect(secondClient.status).toBe(409);
  });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe("POST /auth/login", () => {
  it("returns 200 and a token on valid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...DBUser,
      hashPassword: await getHashPassword(clientUser.password),
    });

    const res = await request(app).post("/api/auth/login").send(clientUser);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body).toHaveProperty("user");
  });

  it("returns 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "123456" });

    expect(res.status).toBe(400);
  });

  it("returns 400 if password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "mojerm@test.com" });

    expect(res.status).toBe(400);
  });

  it("returns 400 on wrong password", async () => {
    const loginUser = { ...DBUser, hashPassword: "hashed_password" };
    prismaMock.user.findUnique.mockResolvedValueOnce(loginUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ ...clientUser, password: "wrongpassword" });

    expect(res.status).toBe(400);
  });

  it("returns 404 if user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@test.com", password: "123456" });

    expect(res.status).toBe(404);
  });
});
