import {  Response, NextFunction } from 'express';
import { Role } from '@generated/prisma/enums';
import { createForbiddenError } from '@/errors';
import { RequestWithUser } from '@/types';

export const authorize = (roles: Role[]) => {
  return (req: RequestWithUser, _: Response, next: NextFunction) => {
    const userRole = (req.user)?.role;

    if (!userRole || !roles.includes(userRole)) {
      throw createForbiddenError();
    }
    next();
};
}
