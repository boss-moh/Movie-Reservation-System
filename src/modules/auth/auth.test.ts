import { describe, it, expect } from "vitest";
import request from "supertest";

import { prismaMock } from "@/test";

import { Role } from "@generated/prisma/enums";
import app from "@/app.js";
import { getHashPassword } from "@/utils/getHashPassword";

const clientUser = {
  id: "user-1",
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
};

const AdminUser = {
  id: "admin-1",
  name: "Admin",
  email: "admin@test.com",
  role: Role.ADMIN,
  hashPassword: "",
  keyForHashing: "",
  createdAt: new Date(),
  password: "adminpassword",
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

// ─── PATCH /auth/promote/:id ──────────────────────────────────────────────────

describe("put /auth/promote", () => {
  it("returns 200 and promoted user when admin", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...AdminUser,
      hashPassword: await getHashPassword(AdminUser.password),
    });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send(AdminUser);

    expect(adminLogin.status).toBe(200);
    const adminToken = adminLogin.body.accessToken;

    prismaMock.user.findUnique.mockResolvedValueOnce(DBUser);
    prismaMock.user.update.mockResolvedValueOnce({
      ...DBUser,
      role: Role.ADMIN,
    });

    const res = await request(app)
      .put("/api/auth/promote")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id: clientUser.id,
        role: Role.ADMIN,
      });

    console.log(JSON.stringify(res));

    expect(res.status).toBe(200);
    expect(res.body.role).toBe("ADMIN");
  });

  it("returns 404 if user to promote does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...AdminUser,
      hashPassword: await getHashPassword(AdminUser.password),
    });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send(AdminUser);

    expect(adminLogin.status).toBe(200);
    const adminToken = adminLogin.body.accessToken;

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .put("/api/auth/promote")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id: "000000",
        role: Role.ADMIN,
      });

    expect(res.status).toBe(404);
  });

  it("returns 403 when regular user tries to promote", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...DBUser,
      hashPassword: await getHashPassword(clientUser.password),
    });

    const userLogin = await request(app)
      .post("/api/auth/login")
      .send(clientUser);

    expect(userLogin.status).toBe(200);
    const userToken = userLogin.body.accessToken;
    const res = await request(app)
      .put("/api/auth/promote")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it("returns 401 when no token provided", async () => {
    const res = await request(app).put("/api/auth/promote");

    expect(res.status).toBe(401);
  });
});
