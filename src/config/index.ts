
import dotenv from 'dotenv';
dotenv.config({ path: '.env' , override:false });

const DATABASE_URL = process.env.DATABASE_URL || "";
const PORT = process.env.PORT || "";
const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "", 10);
const DATABASE_URL_TEST = process.env.DATABASE_URL_TEST || "";
const MODE_FLAG = process.env.MODE_FLAG || "development";

console.log("Environment Variables Loaded:", DATABASE_URL ? "Loaded" : "Not Loaded"
);


const URL = MODE_FLAG === "testing" ? DATABASE_URL_TEST : DATABASE_URL;
export { PORT, URL, JWT_REFRESH_SECRET, JWT_SECRET, SALT_ROUNDS, DATABASE_URL_TEST, MODE_FLAG };
