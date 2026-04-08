import { PATHS } from "@/contants";
import authRouter from "./auth/route";

import { Router } from "express";

const router = Router();

  router.use(PATHS.AUTH.BASE, authRouter);

export default router;
