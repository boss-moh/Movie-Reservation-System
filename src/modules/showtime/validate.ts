import { body, query } from "express-validator";

const RULES = {
  MOVIE_ID: body("movieId")
    .trim()
    .notEmpty()
    .withMessage("Movie ID is required")
    .isUUID()
    .withMessage("Movie ID must be a valid UUID"),

  HALL_ID: body("hallId")
    .trim()
    .notEmpty()
    .withMessage("Hall ID is required")
    .isUUID()
    .withMessage("Hall ID must be a valid UUID"),

  START_TIME: body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .isISO8601()
    .withMessage("Start time must be a valid ISO 8601 date"),

  PRICE_FOR_SEAT: body("priceForSeat")
    .notEmpty()
    .withMessage("Price per seat is required")
    .toFloat()
    .isFloat({ gt: 0 })
    .withMessage("Price per seat must be a positive number"),


  QUERY_MOVIE_ID: query("movieId")
    .optional()
    .isUUID()
    .withMessage("Movie ID must be a valid UUID"),

  QUERY_HALL_ID: query("hallId")
    .optional()
    .isUUID()
    .withMessage("Hall ID must be a valid UUID"),

  QUERY_DATE: query("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date"),

  QUERY_DURATION: query("durationMinutes")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Duration must be a positive integer"),

  QUERY_FROM: query("from")
    .optional()
    .isISO8601()
    .withMessage("From date must be a valid ISO 8601 date"),

  QUERY_TO: query("to")
    .optional()
    .isISO8601()
    .withMessage("To date must be a valid ISO 8601 date"),
};

export const createShowtimeValidation = [
  RULES.MOVIE_ID,
  RULES.HALL_ID,
  RULES.START_TIME,
  RULES.PRICE_FOR_SEAT,
];

export const updateShowtimeValidation = [
  RULES.START_TIME.optional(),
  RULES.PRICE_FOR_SEAT.optional(),
];

export const queryShowtimeValidation = [
  RULES.QUERY_MOVIE_ID,
  RULES.QUERY_HALL_ID,
  RULES.QUERY_FROM,
  RULES.QUERY_TO,
];

export const freeSlotsValidation = [
  RULES.QUERY_DATE,
  RULES.HALL_ID
];
