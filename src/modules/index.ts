import { PATHS } from "@/contants";
import { router as authRouter } from "@/modules/auth";
import { router as userRouter } from "@/modules/user";

import { Router } from "express";

const router = Router();

router.use(PATHS.AUTH.BASE, authRouter);
router.use(PATHS.USER.BASE, userRouter);

export default router;
