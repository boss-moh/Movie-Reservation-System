import { Router } from "express";
import { authenticate, authorize, validator } from "@/middleware";

import {
  deleteUserController,
  getAllUsersController,
  getUserByIdController,
  loginController,
  promoteController,
  refreshTokenController,
  registerController,
  restoreUserController,
} from "./controllers";
import {
  IdValidation,
  loginValidation,
  promoteValidation,
  refreshTokenValidation,
  registerValidation,
} from "./validate";
import { Role } from "@generated/prisma/enums";
import { PATHS } from "@/contants";

const router = Router();

// Public routes
router.post(PATHS.AUTH.REGISTER, registerValidation, validator, registerController);
router.post(PATHS.AUTH.LOGIN, loginValidation, validator, loginController);

// Admin only route
router.put(
  PATHS.AUTH.PROMOTE,
  authenticate,
  authorize([Role.ADMIN]),
  promoteValidation,
  validator,
  promoteController,
);

router.post(
  PATHS.AUTH.REFRESH_TOKEN,
  refreshTokenValidation,
  validator,
  refreshTokenController,
);

router.delete(
  PATHS.AUTH.DELETE_USER,
  authenticate,
  authorize([Role.ADMIN]),
  IdValidation,
  validator,
  deleteUserController,
);

router.put(
  PATHS.AUTH.RESTORE_USER,
  authenticate,
  authorize([Role.ADMIN]),
  IdValidation,
  validator,
  restoreUserController,
);

router.get(
  PATHS.AUTH.GET_ALL_USERS,
  authenticate,
  authorize([Role.ADMIN]),
  getAllUsersController,
);

router.get(
  PATHS.AUTH.GET_USER_BY_ID,
  authenticate,
  authorize([Role.ADMIN]),
  IdValidation,
  validator,
  getUserByIdController,
);

export { router };
export default router;
