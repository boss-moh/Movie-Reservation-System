import { body, param } from "express-validator";
import { SeatType } from "@generated/prisma/enums";

const RULES = {
  HALL_ID: body("hallId")
    .notEmpty()
    .withMessage("Hall ID is required")
    .isUUID()
    .withMessage("Hall ID must be a valid UUID"),

  TYPE: body("type")
    .optional()
    .isIn(Object.values(SeatType))
    .withMessage("Invalid seat type, must be one of: " + Object.values(SeatType).join(", ")),
};



export const seatIdValidation = [
  param("seatId")
    .notEmpty()
    .withMessage("Seat ID is required")
    .isUUID()
    .withMessage("Invalid Seat ID format"),
];

// Hall ID validation
export const hallIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Hall ID is required")
    .isUUID()
    .withMessage("Invalid Hall ID format"),
];

export const createSeatValidation = [RULES.HALL_ID, RULES.TYPE];
export const updateSeatValidation = [RULES.TYPE,...seatIdValidation];
