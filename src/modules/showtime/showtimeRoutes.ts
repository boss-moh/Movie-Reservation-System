import { Router } from "express";
import { authenticate, authorize, validator } from "@/middleware";
import { Role } from "@generated/prisma/enums";
import { IdValidation, PATHS } from "@/contants";

import {
  createShowtimeController,
  getAllShowtimesController,
  getShowtimeByIdController,
  updateShowtimeController,
  deleteShowtimeController,
  restoreShowtimeController,
  getFreeSlotsController,
  getOccupiedSlotsController,
} from "@/modules/showtime/controllers";

import {
  createShowtimeValidation,
  updateShowtimeValidation,
  queryShowtimeValidation,
  freeSlotsValidation,
} from "@/modules/showtime/validate";

const router = Router();

router.get(PATHS.SHOWTIME.GET_ALL, queryShowtimeValidation, validator, getAllShowtimesController);
router.get(PATHS.SHOWTIME.FREE_SLOTS, freeSlotsValidation, validator, getFreeSlotsController);
router.get(PATHS.SHOWTIME.OCCUPIED_SLOTS, freeSlotsValidation, validator, getOccupiedSlotsController);

router.get(PATHS.SHOWTIME.GET_BY_ID, IdValidation, validator, getShowtimeByIdController);

router.post(
  PATHS.SHOWTIME.CREATE,
  authenticate,
  authorize([Role.ADMIN]),
  createShowtimeValidation,
  validator,
  createShowtimeController,
);

router.put(
  PATHS.SHOWTIME.UPDATE,
  authenticate,
  authorize([Role.ADMIN]),
  [...IdValidation, ...updateShowtimeValidation],
  validator,
  updateShowtimeController,
);

router.delete(
  PATHS.SHOWTIME.DELETE,
  authenticate,
  authorize([Role.ADMIN]),
  IdValidation,
  validator,
  deleteShowtimeController,
);

router.put(
  PATHS.SHOWTIME.RESTORE,
  authenticate,
  authorize([Role.ADMIN]),
  IdValidation,
  validator,
  restoreShowtimeController,
);

export { router };
export default router;
