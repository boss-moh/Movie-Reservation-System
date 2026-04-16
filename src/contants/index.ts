import { param } from "express-validator";

export const PATHS = {
  AUTH: {
    BASE: "/auth",
    REGISTER: "/register",
    LOGIN: "/login",
    PROMOTE: "/promote",
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
  }
} as const


export const IdValidation = [
  param('id').isUUID().withMessage('Invalid movie ID'),
];