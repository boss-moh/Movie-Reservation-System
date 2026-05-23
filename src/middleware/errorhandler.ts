import CustomError from "@/errors/CustomError";
import { getErrorMessage } from "@/errors/getErrorMessage";
import { ErrorResponse } from "@/types";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
) => {
  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      response: {
        message: error.message,
        status: error.statusCode,
        success: false,
        data: null,
      },
    });
  }

  return res.status(500).json({
    response: {
      message: getErrorMessage(error),
      status: 500,
      success: false,
      data: null,
    },
  });
};
export default errorHandler;
