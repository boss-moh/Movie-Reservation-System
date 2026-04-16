import { Role } from '@generated/prisma/browser';
import { body } from 'express-validator';

export const promoteValidation = [
  body("id").notEmpty().withMessage("User ID is required"),
  body('role').notEmpty().withMessage('Role is required').isIn(Object.values(Role)).withMessage('Role must be either ADMIN or USER'),
];

