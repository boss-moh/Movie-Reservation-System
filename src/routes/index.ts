import { Router } from "express";
import todoRoutes from "./todo";

const router = Router();
router.use("/todos", todoRoutes);

export default router;
