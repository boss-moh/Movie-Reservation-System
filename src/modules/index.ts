import { PATHS } from "@/contants";
import {router as authRouter} from "@/modules/auth";

import { Router } from "express";

const router = Router();

  router.use(PATHS.AUTH.BASE, authRouter);

export default router;
