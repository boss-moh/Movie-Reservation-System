import { Router } from "express";
import {  authenticate, authorize, validator } from "@/middleware";

import {
  loginController,
  promoteController,
  refreshTokenController,
  registerController,
} from "./controllers";
import {
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

export { router  };
export default router;
