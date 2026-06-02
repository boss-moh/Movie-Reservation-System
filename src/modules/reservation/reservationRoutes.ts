import { Router } from "express";
import { authenticate, validator } from "@/middleware";
import { IdValidation, PATHS } from "@/contants";
import {
  createReservationController,
  getAllReservationsController,
  getReservationByIdController,
  cancelReservationController,
} from "@/modules/reservation/controllers";
import { createReservationValidation } from "@/modules/reservation/validate";

const router = Router();

router.post(
  PATHS.RESERVATION.CREATE,
  authenticate,
  createReservationValidation,
  validator,
  createReservationController,
);

router.get(
  PATHS.RESERVATION.GET_ALL,
  authenticate,
  validator,
  getAllReservationsController,
);
router.get(
  PATHS.RESERVATION.GET_BY_ID,
  authenticate,
  IdValidation,
  validator,
  getReservationByIdController,
);
router.delete(
  PATHS.RESERVATION.DELETE,
  authenticate,
  IdValidation,
  validator,
  cancelReservationController,
);

export { router };
export default router;
