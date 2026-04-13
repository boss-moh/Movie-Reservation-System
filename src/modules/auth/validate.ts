import { Role } from '@generated/prisma/browser';
import { body } from 'express-validator';

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
    
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/\d/).withMessage('Password must contain at least one number'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];


export const promoteValidation = [
  body("id").notEmpty().withMessage("User ID is required"),
  body('role').notEmpty().withMessage('Role is required').isIn(Object.values(Role)).withMessage('Role must be either ADMIN or USER'),
];


export const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];
  