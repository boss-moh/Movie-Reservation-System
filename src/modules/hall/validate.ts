import { body } from "express-validator";

export const createHallValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Hall name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Hall name must be between 2 and 100 characters"),
  body("seatsNumber")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Seats number must be zero or a positive integer"),
  body("seats").optional().isArray().withMessage("Seats must be an array"),
  body("seats.*.type")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Seat type must be a valid string"),
];

export const updateHallValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Hall name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Hall name must be between 2 and 100 characters"),
  body("seatsNumber")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Seats number must be a positive integer"),
];

export const createSeatValidation = [
  body("type")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Seat type must be a valid string"),
];

export const updateSeatValidation = [
  body("type")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Seat type must be a valid string"),
];




