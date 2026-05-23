import { afterAll } from "vitest";

import { prisma  } from '@/libs/prisma/config';

afterAll(async () => {
  await prisma.$disconnect();
});