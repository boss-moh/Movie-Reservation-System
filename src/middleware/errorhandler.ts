import CustomError from "@/errors/CustomError";
import { getErrorMessage } from "@/errors/getErrorMessage";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (error: unknown, req: Request, res: Response,_:NextFunction) => {
  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      message: getErrorMessage(error),
    },
  });
};

export default errorHandler;
