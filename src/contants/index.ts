import { param } from "express-validator";

export const PATHS = {
  AUTH: {
    BASE: "/auth",
    REGISTER: "/register",
    LOGIN: "/login",
    REFRESH_TOKEN: "/refresh-token",
  },
  MOVIE: {
    BASE: "/movies",
    CREATE: "",
    GET_ALL: "",
    GET_BY_ID: "/:id",
    UPDATE: "/:id",
    DELETE: "/:id",
    RESTORE: "/:id/restore",

  },
  USER: {
    BASE: "/users",
    PROMOTE: "/promote",
    DELETE_USER: "/:id",
    RESTORE_USER: "/restore/:id",
    GET_ALL_USERS: "/",
    GET_USER_BY_ID: "/:id",
  }

} as const


export const IdValidation = [
  param("id").notEmpty().withMessage("User ID is required").isUUID().withMessage("Invalid User ID format"),
];
