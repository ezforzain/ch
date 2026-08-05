import { body } from 'express-validator';

export const faqValidator = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required'),
  body('category').optional().trim(),
  body('isActive').optional().isBoolean(),
];
