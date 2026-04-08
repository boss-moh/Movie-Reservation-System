
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const DATABASE_URL = process.env.DATABASE_URL || "";
const PORT = process.env.PORT || "";

console.log("Environment Variables Loaded:", {
  DATABASE_URL: DATABASE_URL != "" ? "Loaded" : "Not Loaded",
  PORT: PORT != "" ? "Loaded" : "Not Loaded",
});

export { PORT, DATABASE_URL };
