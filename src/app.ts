import routes from "@/routes";
import express from "express";

import { errorHandler } from "@/middleware";

const app = express();

app.use(express.json());
app.use(routes);
app.use(errorHandler);

export { app };
export default app;
