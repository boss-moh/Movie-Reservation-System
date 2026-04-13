import express from "express";
import morgan from "morgan";
import fullRouters from "./modules";
import { errorHandler } from "./middleware";


const app = express();


app.use(express.json());
app.use(morgan("dev"));


app.use("/api", fullRouters);

app.get("/", async (_req, res) => {
  res.send("Welcome to the Movie API!");
});

// Global error handler
app.use(errorHandler);

export { app };
export default app;