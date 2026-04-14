import { PATHS } from "@/contants";
import {router as authRouter} from "@/modules/auth";
import {router as movieRouter} from "@/modules/movie";

import { Router } from "express";

const router = Router();

  router.use(PATHS.AUTH.BASE, authRouter);
  router.use(PATHS.MOVIE.BASE, movieRouter);

export default router;
