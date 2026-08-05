import { body } from 'express-validator';

export const createLeadValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().isLength({ min: 7 }).withMessage('Enter a valid phone number'),
  body('email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Enter a valid email address'),
  body('city').optional().trim(),
  body('service').optional().trim(),
  body('message').optional().trim(),
];

export const updateLeadValidator = [
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'converted', 'lost']),
  body('assignedTo').optional({ values: 'falsy' }).isMongoId(),
  body('notes').optional().trim(),
];
