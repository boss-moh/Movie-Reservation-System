import { body, param } from 'express-validator';

export const createMovieValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3 }).withMessage('Title must be at least 3 characters long').isLength({ max: 100 }).withMessage('Title must be less than 100 characters long'),
  body('durationMinutes').isInt({ gt: 0 }).withMessage('Duration must be a positive integer').isInt({
    lt: 240
  }).withMessage('Duration must be less than 240 minutes'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('description').optional().isString(),
  body('posterUrl').optional().isURL().withMessage('Poster URL must be a valid URL'),
];


export const updateMovieValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ min: 3 }).withMessage('Title must be at least 3 characters long').isLength({ max: 100 }).withMessage('Title must be less than 100 characters long'),
  body('durationMinutes').optional().isInt({ gt: 0 }).withMessage('Duration must be a positive integer').isInt({
    lt: 240
  }).withMessage('Duration must be less than 240 minutes'),
  body('genre').optional().trim().notEmpty().withMessage('Genre cannot be empty').isLength({ min: 3 }).withMessage('Genre must be at least 3 characters long').isLength({ max: 100 }).withMessage('Genre must be less than 100 characters long'),
  body('description').optional().isString().isLength({ min: 3 }).withMessage('Description must be at least 3 characters long').isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters long'),
  body('posterUrl').optional().isURL().withMessage('Poster URL must be a valid URL'),
];


