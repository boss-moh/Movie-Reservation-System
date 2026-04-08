// import routes from "@/routes";
import express from "express";
import morgan from "morgan";


const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Welcome to the Movie API!");
});

export { app };
export default app;
