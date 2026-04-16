import { Router } from "express";
import { authenticate, authorize, validator } from "@/middleware";

import {
  getAllUsersController,
  getUserByIdController,
  deleteUserController,
  promoteController,
  restoreUserController,
} from "./controllers";

import {
  promoteValidation,
} from "./validate";

import { Role } from "@generated/prisma/enums";
import { IdValidation, PATHS } from "@/contants";

const router = Router();



router.get(
  PATHS.USER.GET_ALL_USERS,
  authenticate,
  authorize([Role.ADMIN]),
  getAllUsersController,
);

router.get(
  PATHS.USER.GET_USER_BY_ID,
  authenticate,
  authorize([Role.ADMIN]),
  IdValidation,
  validator,
  getUserByIdController,
);

router.put(
  PATHS.USER.PROMOTE,
  authenticate,
  authorize([Role.ADMIN]),
  promoteValidation,
  validator,
  promoteController,
);

router.put(
  PATHS.USER.RESTORE_USER,
  authenticate,
  authorize([Role.ADMIN]),
  IdValidation,
  validator,
  restoreUserController,
);


router.delete(
  PATHS.USER.DELETE_USER,
  authenticate,
  authorize([Role.ADMIN]),
  IdValidation,
  validator,
  deleteUserController,
);



export { router };
export default router;
