import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/** Normalizes Mongoose/JWT/multer errors into ApiError shape, then sends the
 * final { success:false, message, errors } response. Must be the last
 * middleware registered in app.js. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error.name === 'ValidationError') {
      // Mongoose schema validation failure
      const errors = Object.values(error.errors).map((e) => ({ field: e.path, message: e.message }));
      error = new ApiError(400, 'Validation failed', errors);
    } else if (error.code === 11000) {
      // Mongoose duplicate key
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      error = new ApiError(409, `${field} "${error.keyValue?.[field]}" is already in use.`);
    } else if (error.name === 'CastError') {
      error = new ApiError(400, `Invalid value for "${error.path}": ${error.value}`);
    } else if (error.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid authentication token.');
    } else if (error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Authentication token has expired.');
    } else if (error.name === 'MulterError') {
      error = new ApiError(400, `Upload error: ${error.message}`);
    } else {
      error = new ApiError(error.statusCode || 500, error.message || 'Internal server error');
    }
  }

  if (env.nodeEnv !== 'test' && error.statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    errors: error.errors && error.errors.length ? error.errors : undefined,
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
  });
}
