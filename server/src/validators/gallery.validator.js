import { body } from 'express-validator';

export const galleryItemValidator = [
  body('title').optional().trim(),
  body('category').optional().trim(),
  body('isPublished').optional().isBoolean(),
  body('sortOrder').optional().isInt(),
];
