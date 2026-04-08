import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createunauthenticateError } from "@/errors";
import { JWT_SECRET } from "@/config";
import { RequestWithUser, userDTO } from "@/types";

export const authenticate = (
  req: RequestWithUser,
  _res: Response,
  next: NextFunction,
) => {
    const token = req.headers?.["authorization"]?.split(" ")[1];

    if (!token) {
      throw createunauthenticateError();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as userDTO ;
    req.user = decoded;
    next();
 
};
