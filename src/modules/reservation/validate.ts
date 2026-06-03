import { body } from "express-validator";

const RULES = {
  SHOWTIME_ID: body("showtimeId")
    .trim()
    .notEmpty()
    .withMessage("Showtime ID is required")
    .isUUID()
    .withMessage("Showtime ID must be a valid UUID"),

  SEAT_IDS: body("seatIds")
    .isArray({ min: 1 })
    .withMessage("At least one seat must be selected")
    .custom((value) => Array.isArray(value) && value.length > 0),

  SEAT_ID_ITEM: body("seatIds.*")
    .trim()
    .notEmpty()
    .withMessage("Seat ID must be provided")
    .isUUID()
    .withMessage("Seat ID must be a valid UUID"),
};

export const createReservationValidation = [
  RULES.SHOWTIME_ID,
  RULES.SEAT_IDS,
  RULES.SEAT_ID_ITEM,
];
