import { Router } from "express";
import { authenticate, validator } from "@/middleware";

import {
  loginController,
  refreshTokenController,
  registerController,
} from "./controllers";
import {
  loginValidation,
  refreshTokenValidation,
  registerValidation,
} from "./validate";
import { PATHS } from "@/contants";

const router = Router();

// Public routes
router.post(PATHS.AUTH.REGISTER, registerValidation, validator, registerController);
router.post(PATHS.AUTH.LOGIN, loginValidation, validator, loginController);

router.post(
  PATHS.AUTH.REFRESH_TOKEN,
  authenticate,
  refreshTokenValidation,
  validator,
  refreshTokenController,
);

export { router };
export default router;
