import { Router } from "express";
import { authenticate, authorize, validator } from "@/middleware";
import { Role } from "@generated/prisma/enums";
import { PATHS } from "@/contants";

import {
  createSeatController,
  getAllSeatsController,
  getSeatByIdController,
  getSeatsByHallIdController,
  updateSeatController,
  deleteSeatController,
  restoreSeatController,
} from "./controllers";

import {
  createSeatValidation,
  hallIdValidation,
  seatIdValidation,
  updateSeatValidation,
} from "./validate";

const router = Router();

// Seat ID validation


// Public routes
router.get(PATHS.SEAT.GET_ALL, getAllSeatsController);
router.get(PATHS.SEAT.GET_BY_HALL, hallIdValidation, validator, getSeatsByHallIdController);
router.get(PATHS.SEAT.GET_BY_ID, seatIdValidation, validator, getSeatByIdController);

// Admin only routes
router.post(
  PATHS.SEAT.CREATE,
  authenticate,
  authorize([Role.ADMIN]),
  createSeatValidation,
  validator,
  createSeatController
);

router.put(
  PATHS.SEAT.UPDATE,
  authenticate,
  authorize([Role.ADMIN]),
  updateSeatValidation,
  validator,
  updateSeatController
);

router.delete(
  PATHS.SEAT.DELETE,
  authenticate,
  authorize([Role.ADMIN]),
  seatIdValidation,
  validator,
  deleteSeatController
);

router.put(
  PATHS.SEAT.RESTORE,
  authenticate,
  authorize([Role.ADMIN]),
  seatIdValidation,
  validator,
  restoreSeatController
);

export { router };
