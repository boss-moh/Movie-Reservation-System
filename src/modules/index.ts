import { PATHS } from "@/contants";
import { router as movieRouter } from "@/modules/movie";
import { router as authRouter } from "@/modules/auth";
import { router as userRouter } from "@/modules/user";
import { hallRouter } from "@/modules/hall";

import { Router } from "express";

const router = Router();

router.use(PATHS.AUTH.BASE, authRouter);
router.use(PATHS.MOVIE.BASE, movieRouter);
router.use(PATHS.USER.BASE, userRouter);
router.use(PATHS.HALL.BASE, hallRouter);

export default router;
