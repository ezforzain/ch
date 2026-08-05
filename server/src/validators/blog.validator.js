import { body } from 'express-validator';

export const blogPostValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 160 }),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('excerpt').optional().trim().isLength({ max: 300 }),
  body('isPublished').optional().isBoolean(),
];
