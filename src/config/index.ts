import { connectDB } from "./DB";

const MONGO_URL = process.env.MONGO_URL || "";
const PORT = process.env.PORT || "";

console.log("Environment Variables Loaded:", {
  MONGO_URL: MONGO_URL != "" ? "Loaded" : "Not Loaded",
  PORT: PORT != "" ? "Loaded" : "Not Loaded",
});

export { PORT, MONGO_URL, connectDB };
