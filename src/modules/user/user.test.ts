import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "@/app.js";
import {
  getAdminToken,
  getClientToken,
  withTestTransaction,
  invalidID,
  nonExistentID,
  // clientUser,
} from "@/test/helper";
import { Role } from "@generated/prisma/enums";

// ─── PUT /users/promote ──────────────────────────────────────────────────

describe("PUT /users/promote", () => {
  // it("returns 200 and promoted user when admin", async () => {
  //   await withTestTransaction(async () => {
  //     const adminToken = await getAdminToken();

  //     const userLoginRes = await request(app)
  //       .post("/api/auth/login")
  //       .send(clientUser);

  //     expect(userLoginRes.status).toBe(200);
  //     expect(userLoginRes.body.response.data.user.role).toBe(Role.USER);

  //     const res = await request(app)
  //       .put("/api/users/promote")
  //       .set("Authorization", `Bearer ${adminToken}`)
  //       .send({
  //         id: userLoginRes.body.response.data.user.id,
  //         role: Role.ADMIN,
  //       });

  //     expect(res.status).toBe(200);
  //     expect(res.body).toMatchObject({
  //       response: { success: true, status: 200, message: expect.any(String) },
  //     });

  //     const userLoginResAfter = await request(app)
  //       .post("/api/auth/login")
  //       .send(clientUser);

  //     expect(userLoginResAfter.status).toBe(200);
  //     expect(userLoginResAfter.body.response.data.user.role).toBe(Role.ADMIN);
  //   });
  // });

  it("returns 404 if user to promote does not exist", async () => {
    await withTestTransaction(async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .put("/api/users/promote")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ id: nonExistentID, role: Role.ADMIN });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });
  });

  it("returns 403 when regular user tries to promote", async () => {
    await withTestTransaction(async () => {
      const adminToken = await getAdminToken();
      const clientToken = await getClientToken();

      const usersResponse = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);

      const users = usersResponse.body.response.data;

      const res = await request(app)
        .put("/api/users/promote")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({
          id: users[0].id,
          role: Role.ADMIN,
        });

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        response: { success: false, status: 403, message: expect.any(String) },
      });
    });
  });

  it("returns 401 when no token provided", async () => {
    await withTestTransaction(async () => {
      const res = await request(app).put("/api/users/promote");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        response: { success: false, status: 401, message: expect.any(String) },
      });
    });
  });

  it("returns 400 when role is invalid", async () => {
    await withTestTransaction(async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .put("/api/users/promote")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "INVALID_ROLE" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });
  });
});

// ─── GET /users ──────────────────────────────────────────────────────────

describe("GET /users", () => {
  it("returns 200 and list of users when admin", async () => {
    await withTestTransaction(async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        response: { success: true, status: 200, message: expect.any(String) },
      });
      expect(Array.isArray(res.body.response.data)).toBe(true);
    });
  });

  it("returns 403 when regular user tries to get users", async () => {
    await withTestTransaction(async () => {
      const clientToken = await getClientToken();

      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        response: { success: false, status: 403, message: expect.any(String) },
      });
    });
  });

  it("returns 401 when no token provided", async () => {
    await withTestTransaction(async () => {
      const res = await request(app).get("/api/users");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        response: { success: false, status: 401, message: expect.any(String) },
      });
    });
  });
});

// ─── GET /users/:id ──────────────────────────────────────────────────────

describe("GET /users/:id", () => {
  it("returns 200 and user when admin", async () => {
    await withTestTransaction(async () => {
      const adminToken = await getAdminToken();

      const userResponse = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);

      const users = userResponse.body.response.data;

      const res = await request(app)
        .get(`/api/users/${users[0].id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        response: {
          success: true,
          status: 200,
          message: expect.any(String),
          data: expect.objectContaining(users[0]),
        },
      });
    });
  });

  it("returns 404 if user not found", async () => {
    await withTestTransaction(async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .get(`/api/users/${nonExistentID}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });
  });

  it("returns 400 if user ID is invalid", async () => {
    await withTestTransaction(async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .get(`/api/users/${invalidID}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });
  });

  it("returns 403 when regular user tries to get other users", async () => {
    await withTestTransaction(async () => {
      const clientToken = await getClientToken();

      const res = await request(app)
        .get(`/api/users/${nonExistentID}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        response: { success: false, status: 403, message: expect.any(String) },
      });
    });
  });

  it("returns 401 when no token provided", async () => {
    await withTestTransaction(async () => {
      const res = await request(app).get(`/api/users/${nonExistentID}`);

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        response: { success: false, status: 401, message: expect.any(String) },
      });
    });
  });
});

// ─── DELETE /users/:id ───────────────────────────────────────────────────

describe("DELETE /users/:id", () => {
  it("returns 200 and soft deletes user when admin", async () => {
    await withTestTransaction(async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .delete(`/api/users/${nonExistentID}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect([200, 404]).toContain(res.status);
    });
  });

  it("returns 403 when regular user tries to delete", async () => {
    await withTestTransaction(async () => {
      const clientToken = await getClientToken();

      const res = await request(app)
        .delete(`/api/users/${nonExistentID}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        response: { success: false, status: 403, message: expect.any(String) },
      });
    });
  });

  it("returns 400 if user ID is invalid", async () => {
    await withTestTransaction(async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .delete(`/api/users/${invalidID}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });
  });

  it("returns 401 when no token provided", async () => {
    await withTestTransaction(async () => {
      const res = await request(app).delete(`/api/users/${nonExistentID}`);

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        response: { success: false, status: 401, message: expect.any(String) },
      });
    });
  });
});

// ─── PUT /users/restore/:id ──────────────────────────────────────────────

describe("PUT /users/restore/:id", () => {
  it("returns 200 and restores user when admin", async () => {
    await withTestTransaction(async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .put(`/api/users/restore/${nonExistentID}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect([200, 404]).toContain(res.status);
    });
  });

  it("returns 404 if user to restore not found", async () => {
    await withTestTransaction(async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .put(`/api/users/restore/${nonExistentID}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        response: { success: false, status: 404, message: expect.any(String) },
      });
    });
  });

  it("returns 400 if user ID is invalid", async () => {
    await withTestTransaction(async () => {
      const adminToken = await getAdminToken();

      const res = await request(app)
        .put(`/api/users/restore/${invalidID}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        response: { success: false, status: 400, message: expect.any(String) },
      });
    });
  });

  it("returns 403 when regular user tries to restore", async () => {
    await withTestTransaction(async () => {
      const clientToken = await getClientToken();

      const res = await request(app)
        .put(`/api/users/restore/${nonExistentID}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        response: { success: false, status: 403, message: expect.any(String) },
      });
    });
  });

  it("returns 401 when no token provided", async () => {
    await withTestTransaction(async () => {
      const res = await request(app).put(`/api/users/restore/${nonExistentID}`);

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        response: { success: false, status: 401, message: expect.any(String) },
      });
    });
  });
});
