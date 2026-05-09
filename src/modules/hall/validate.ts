import { body } from "express-validator";
import { Status } from "@generated/prisma/client";


const RULES = {
  NAME: body("name")
    .trim()
    .notEmpty()
    .withMessage("Hall name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Hall name must be between 2 and 100 characters"),

  STATUS: body("status")
    .optional()
    .isIn(Object.values(Status))
    .withMessage("Invalid hall status it should be one from these values " + Object.values(Status).join(", ")),

  SEATS_NUMBER: body("seatsNumber")
    .isInt({ min: 10 })
    .withMessage("Seats number must be  ten or a positive integer"),
}


export const createHallValidation = [RULES.NAME, RULES.STATUS, RULES.SEATS_NUMBER];

export const updateHallValidation = [
  RULES.NAME.optional(),
  RULES.STATUS.optional()
];




