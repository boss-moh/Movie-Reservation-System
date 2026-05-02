import { Router } from "express";
import { authenticate, authorize, validator } from "@/middleware";
import { Role } from "@generated/prisma/enums";
import { IdValidation, PATHS } from "@/contants";

import {
  createHallController,
  getAllHallsController,
  getHallByIdController,
  updateHallController,

} from "@/modules/hall/controllers";

import {
  createHallValidation,
  updateHallValidation,
} from "@/modules/hall/validate";



const router = Router();

router.get(PATHS.HALL.GET_ALL, getAllHallsController);
router.get(PATHS.HALL.GET_BY_ID, IdValidation, validator, getHallByIdController);

router.post(
  PATHS.HALL.CREATE,
  authenticate,
  authorize([Role.ADMIN]),
  createHallValidation,
  validator,
  createHallController,
);

router.put(
  PATHS.HALL.UPDATE,
  authenticate,
  authorize([Role.ADMIN]),
  [...IdValidation, ...updateHallValidation],
  validator,
  updateHallController,
);








export { router };
export default router;
