// src/test/normal.test.ts
import { describe, it, expect } from "vitest";
import { prismaMock } from ".";

describe("Prisma mock behavior", () => {
  it("returns a mocked user from findUnique", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      name: "Mojerm",
      email: "mojerm@test.com",
    });

    const user = await prismaMock.user.findUnique({ where: { id: 1 } });

    expect(user).toEqual({
      id: 1,
      name: "Mojerm",
      email: "mojerm@test.com",
    });
  });

  it("returns null when no user is found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const user = await prismaMock.user.findUnique({ where: { id: 999 } });

    expect(user).toBeNull();
  });

  it("returns a mocked users array from findMany", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 1, name: "Mojerm", email: "mojerm@test.com" },
    ]);

    const users = await prismaMock.user.findMany();

    expect(users).toEqual([
      { id: 1, name: "Mojerm", email: "mojerm@test.com" },
    ]);
  });
});