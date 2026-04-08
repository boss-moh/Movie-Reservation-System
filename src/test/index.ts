// src/test/mocks/prisma.ts
import { mockDeep, mockReset } from "vitest-mock-extended";
import { PrismaClient } from "@generated/prisma/client";
import { beforeEach, vi } from "vitest";

// create the mock
export const prismaMock = mockDeep<PrismaClient>();

// replace the real prisma with the mock before each test
vi.mock("./client.ts", () => ({
  default: prismaMock,
}));

// reset all mocks before each test so they don't bleed into each other
beforeEach(() => {
  mockReset(prismaMock);
});