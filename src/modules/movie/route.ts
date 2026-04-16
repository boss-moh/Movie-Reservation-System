import { Router } from "express";
import { authenticate, authorize, validator } from "@/middleware";
import { Role } from "@generated/prisma/enums";
import { IdValidation, PATHS } from "@/contants";

import {
  createMovieController,
  getAllMoviesController,
  getMovieByIdController,
  updateMovieController,
  deleteMovieController,
  restoreMovieController,
} from "./controllers";

import {
  createMovieValidation,
  updateMovieValidation,
} from "./validate";

const router = Router();

// Public routes
router.get(PATHS.MOVIE.GET_ALL, getAllMoviesController);
router.get(PATHS.MOVIE.GET_BY_ID, IdValidation, validator, getMovieByIdController);

// Admin only routes
router.post(
  PATHS.MOVIE.CREATE,
  authenticate,
  authorize([Role.ADMIN]),
  createMovieValidation,
  validator,
  createMovieController
);

router.put(
  PATHS.MOVIE.UPDATE,
  authenticate,
  authorize([Role.ADMIN]),
  IdValidation,
  validator,
  updateMovieValidation,
  validator,
  updateMovieController
);

router.delete(
  PATHS.MOVIE.DELETE,
  authenticate,
  authorize([Role.ADMIN]),
  IdValidation,
  validator,
  deleteMovieController
);

router.put(
  PATHS.MOVIE.RESTORE,
  authenticate,
  authorize([Role.ADMIN]),
  IdValidation,
  validator,
  restoreMovieController
);

export { router };
export default router;
