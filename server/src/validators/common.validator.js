import { param } from 'express-validator';

export const mongoIdParam = (name = 'id') => [param(name).isMongoId().withMessage(`Invalid ${name}`)];
