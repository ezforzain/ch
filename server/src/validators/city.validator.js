import { body } from 'express-validator';

export const cityValidator = [
  body('name').trim().notEmpty().withMessage('City name is required'),
  body('province').optional().trim(),
  body('isActive').optional().isBoolean(),
];
