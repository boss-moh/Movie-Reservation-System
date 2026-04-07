import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { TodoUtils } from '@/models';

import {sampleTodosWithIds} from "@/contants";


let mongoFake: MongoMemoryServer;


console.log("Setting up in-memory MongoDB for tests...");

beforeAll(async () => {
  mongoFake = await MongoMemoryServer.create();
  await mongoose.connect(mongoFake.getUri());
});

beforeEach(async () => {
  // wipe all collections
  const collections = mongoose.connection.collections;
  console.log("Clearing collections before test...");
  console.log("Collections found:", Object.keys(collections));
  for (const key in collections) {
    console.log(`Clearing collection: ${collections[key]}`);
    await collections[key]!.deleteMany({});
  }

  // re-insert the same data before every test
  await TodoUtils.insertMany(sampleTodosWithIds);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoFake.stop();
});



// ## How it works
// ```
// before test 1 → wipe DB → insert seedData ✅
// before test 2 → wipe DB → insert seedData ✅
// before test 3 → wipe DB → insert seedData ✅