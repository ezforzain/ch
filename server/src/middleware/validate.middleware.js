import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/** Runs after an express-validator chain array; turns any accumulated field
 * errors into a single 400 ApiError with a structured `errors` list. */
export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((e) => ({ field: e.path, message: e.msg }));
  next(ApiError.badRequest('Validation failed', errors));
}
