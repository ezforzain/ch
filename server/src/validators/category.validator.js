import { body } from 'express-validator';

export const categoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 60 }),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt(),
];
