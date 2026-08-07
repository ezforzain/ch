import { body } from 'express-validator';

export const projectValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').isIn(['Residential', 'Commercial', 'Security']).withMessage('Invalid category'),
  body('status').optional().isIn(['Completed', 'In progress', 'Pending']).withMessage('Invalid status'),
  body('location').optional().trim(),
  body('size').optional().trim(),
  body('completionTime').optional().trim(),
  body('result').optional().trim(),
  body('isFeatured').optional().isBoolean(),
  body('isPublished').optional().isBoolean(),
];
