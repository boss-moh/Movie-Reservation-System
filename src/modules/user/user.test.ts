import request from "supertest";
import { describe, it, expect } from "vitest";

import { prismaMock } from "@/test";

import { Role } from "@generated/prisma/enums";
import app from "@/app.js";
import { getHashPassword } from "@/utils";

const invalidId = "dc988870-29a1-4210-a742-6171ff40d1e8";

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

const AdminUser = {
  id: "dc988870-29a1-4210-a742-6171ff40d1e",
  name: "Admin",
  email: "admin@test.com",
  role: Role.ADMIN,
  hashPassword: "",
  keyForHashing: "",
  createdAt: new Date(),
  password: "adminpassword",
  isDeleted: false,
  deletedAt: null,
};


// ─── PUT /users/promote ──────────────────────────────────────────────────

describe("PUT /users/promote", () => {
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
      .put("/api/users/promote")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id: clientUser.id,
        role: Role.ADMIN,
      });


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
      .put("/api/users/promote")
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
      .put("/api/users/promote")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it("returns 401 when no token provided", async () => {
    const res = await request(app).put("/api/users/promote");

    expect(res.status).toBe(401);
  });
});

// ─── GET /users ──────────────────────────────────────────────────────────

describe("GET /users", () => {
  it("returns 200 and list of users when admin", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...AdminUser,
      hashPassword: await getHashPassword(AdminUser.password),
    });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send(AdminUser);

    const adminToken = adminLogin.body.accessToken;

    prismaMock.user.findMany.mockResolvedValueOnce([DBUser, AdminUser]);

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it("returns 403 when regular user tries to get users", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...DBUser,
      hashPassword: await getHashPassword(clientUser.password),
    });

    const userLogin = await request(app)
      .post("/api/auth/login")
      .send(clientUser);

    const userToken = userLogin.body.accessToken;

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});

// ─── GET /users/:id ──────────────────────────────────────────────────────

describe("GET /users/:id", () => {
  it("returns 200 and user when admin", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...AdminUser,
      hashPassword: await getHashPassword(AdminUser.password),
    });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send(AdminUser);

    const adminToken = adminLogin.body.accessToken;

    prismaMock.user.findUnique.mockResolvedValueOnce(DBUser);

    const res = await request(app)
      .get(`/api/users/${DBUser.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(DBUser.email);
  });

  it("returns 404 if user not found", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...AdminUser,
      hashPassword: await getHashPassword(AdminUser.password),
    });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send(AdminUser);

    const adminToken = adminLogin.body.accessToken;

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .get(`/api/users/${invalidId}`)
      .set("Authorization", `Bearer ${adminToken}`);


    expect(res.status).toBe(404);
  });
});

// ─── DELETE /users/:id ───────────────────────────────────────────────────

describe("DELETE /users/:id", () => {
  it("returns 200 and soft deletes user when admin", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...AdminUser,
      hashPassword: await getHashPassword(AdminUser.password),
    });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send(AdminUser);

    const adminToken = adminLogin.body.accessToken;

    prismaMock.user.findUnique.mockResolvedValueOnce(DBUser);
    prismaMock.user.update.mockResolvedValueOnce({
      ...DBUser,
      isDeleted: true,
      deletedAt: new Date(),
    });

    const res = await request(app)
      .delete(`/api/users/${DBUser.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.isDeleted).toBe(true);
  });

  it("returns 403 when regular user tries to delete", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...DBUser,
      hashPassword: await getHashPassword(clientUser.password),
    });

    const userLogin = await request(app)
      .post("/api/auth/login")
      .send(clientUser);

    const userToken = userLogin.body.accessToken;

    const res = await request(app)
      .delete(`/api/users/${DBUser.id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});

// ─── PUT /users/restore/:id ──────────────────────────────────────────────

describe("PUT /users/restore/:id", () => {
  it("returns 200 and restores user when admin", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...AdminUser,
      hashPassword: await getHashPassword(AdminUser.password),
    });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send(AdminUser);

    const adminToken = adminLogin.body.accessToken;

    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...DBUser,
      isDeleted: true,
      deletedAt: new Date(),
    });

    prismaMock.user.update.mockResolvedValueOnce({
      ...DBUser,
      isDeleted: false,
      deletedAt: null,
    });

    const res = await request(app)
      .put(`/api/users/restore/${DBUser.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.isDeleted).toBe(false);
  });

  it("returns 404 if user to restore not found", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...AdminUser,
      hashPassword: await getHashPassword(AdminUser.password),
    });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send(AdminUser);

    const adminToken = adminLogin.body.accessToken;

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .put(`/api/users/restore/${invalidId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
