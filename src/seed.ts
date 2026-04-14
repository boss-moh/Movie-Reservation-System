import { connectDB } from "@/config";
import { TodoUtils } from "@/models";
import {sampleTodos} from "@/contants";


async function seed() {
  try {
    await connectDB();
    console.log("Connected to DB — seeding...");

    const created = await TodoUtils.insertMany(sampleTodos);
    console.log(`✅ Seeded ${created.length} todos`);
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

seed();
