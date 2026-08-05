import { body } from 'express-validator';

export const teamMemberValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').trim().notEmpty().withMessage('Role/title is required'),
  body('email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Enter a valid email address'),
  body('bio').optional().trim(),
  body('isActive').optional().isBoolean(),
];
