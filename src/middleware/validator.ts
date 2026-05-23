import { ErrorResponse } from "@/types";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "express-validator";
import { validationResult } from "express-validator/lib/validation-result";

export const validator = (
  req: Request,
  res: Response<ErrorResponse<Record<string, ValidationError>>>,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      response: {
        message:
          "There were some issues with your submission. Please check the details below.",
        status: 400,
        success: false,
        data: errors.mapped(),
      },
    });
    return;
  }

  next();
};
