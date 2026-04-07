import { body, ValidationChain, param } from "express-validator";

/**
 * Validation rules for creating a new todo
 */
export const createTodoRules = (): ValidationChain[] => {
  return [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Title must be between 1 and 100 characters"),

    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),

    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Priority must be one of: low, medium, high"),

    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid ISO 8601 date"),

    body("completed")
      .optional()
      .isBoolean()
      .withMessage("Completed must be a boolean"),
  ];
};

/**
 * Validation rules for editing an existing todo
 */
export const editTodoRules = (): ValidationChain[] => {
  return [
    body("title")
      .optional()
      .isString()
      .withMessage("Title must be a string")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Title must be between 1 and 100 characters"),

    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),

    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Priority must be one of: low, medium, high"),

    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid ISO 8601 date"),

    body("completed")
      .optional()
      .isBoolean()
      .withMessage("Completed must be a boolean"),
  ];
};

export const idRules = (): ValidationChain[] => {
  return [param("id").isMongoId().withMessage("Invalid ID format")];
};
