// src/tests/helpers/db.ts

import app from "@/app";
import { prisma } from "@/libs/prisma/config";
import { adminUser, clientUser } from "@/libs/prisma";
import { Prisma } from "@generated/prisma/client";
import request from "supertest";

const ERR_ROLLBACK = "__ROLLBACK__";


export async function withTestTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  let result: T | undefined;

  try {
    // 1. Await the entire Prisma transaction block
    await prisma.$transaction(
      async (tx) => {
        result = await fn(tx);

        // Always throw to force the rollback *inside* the transaction lifecycle
        throw new Error(ERR_ROLLBACK);
        
      },
      {
        isolationLevel:"Serializable"
      }
    );
  } catch (err) {
    // 2. Catch the expected rollback error and do nothing (swallow it)
    if (err instanceof Error && err.message === ERR_ROLLBACK) {
      // If we caught our rollback, it means `result` was successfully populated
      return result as T;
    }

    // 3. If it's a real database error, re-throw it so your test fails properly
    throw err;
  }

  throw new Error("Transaction ended unexpectedly without rolling back.");
}

export const getAdminToken = async () => {
  const res = await request(app).post("/api/auth/login").send(adminUser);
  return res.body.response.data.accessToken;
};

export const getClientToken = async () => {
  const res = await request(app).post("/api/auth/login").send(clientUser);
  return res.body.response.data.accessToken;
};

const invalidID = "0000-0000-0000-000000000000";
const nonExistentID = "00000000-0000-0000-0000-000000000000";

export { adminUser, clientUser, invalidID, nonExistentID };
