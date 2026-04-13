
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const DATABASE_URL = process.env.DATABASE_URL || "";
const PORT = process.env.PORT || "";
const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "", 10);

console.log("Environment Variables Loaded:", {
  DATABASE_URL: DATABASE_URL != "" ? "Loaded" : "Not Loaded",
  PORT: PORT != "" ? "Loaded" : "Not Loaded",
  JWT_SECRET: JWT_SECRET != "" ? "Loaded" : "Not Loaded",
  JWT_REFRESH_SECRET: JWT_REFRESH_SECRET != "" ? "Loaded" : "Not Loaded",
});

export { PORT, DATABASE_URL ,JWT_REFRESH_SECRET, JWT_SECRET,SALT_ROUNDS};
