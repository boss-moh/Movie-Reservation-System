import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator/lib/validation-result";

export const validator = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      message:
        "There were some issues with your submission. Please check the details below.",
      errors: errors.mapped(),
    });
    return;
  }

  next();
};
