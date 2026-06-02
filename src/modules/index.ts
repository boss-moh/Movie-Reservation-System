import { PATHS } from "@/contants";
import { router as movieRouter } from "@/modules/movie";
import { router as authRouter } from "@/modules/auth";
import { router as userRouter } from "@/modules/user";
import { hallRouter } from "@/modules/hall";
import { showtimeRouter } from "@/modules/showtime";
import { router as seatRouter } from "@/modules/seat";
import { reservationRouter } from "@/modules/reservation";

import { Router } from "express";

const router = Router();

router.use(PATHS.AUTH.BASE, authRouter);
router.use(PATHS.MOVIE.BASE, movieRouter);
router.use(PATHS.USER.BASE, userRouter);
router.use(PATHS.HALL.BASE, hallRouter);
router.use(PATHS.SHOWTIME.BASE, showtimeRouter);
router.use(PATHS.SEAT.BASE, seatRouter);
router.use(PATHS.RESERVATION.BASE, reservationRouter);

export default router;
