// @/test (your singleton/mock setup file)
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { beforeEach, vi } from 'vitest';
import { PrismaClient } from '@generated/prisma/client';

const prisma = mockDeep<PrismaClient>();

vi.mock('@/libs/prisma', () => ({
  prisma,
}));

beforeEach(() => {
  mockReset(prisma);
});

export { prisma as prismaMock };
