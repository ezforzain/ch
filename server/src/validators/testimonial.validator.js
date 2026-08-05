import { body } from 'express-validator';

export const testimonialValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('quote').trim().notEmpty().withMessage('Quote is required').isLength({ max: 600 }),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('location').optional().trim(),
  body('isVerified').optional().isBoolean(),
  body('isPublished').optional().isBoolean(),
];
