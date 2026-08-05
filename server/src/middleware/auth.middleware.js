import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/generateTokens.js';
import { User } from '../models/User.js';

/** Requires a valid `Authorization: Bearer <accessToken>` header, attaches the
 * authenticated user to req.user. */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized('You are not logged in. Please log in to continue.');

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Your session has expired or is invalid. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('The user for this session no longer exists.');
  if (!user.isActive) throw ApiError.forbidden('Your account has been deactivated. Contact an administrator.');
  if (user.passwordChangedAfter(payload.iat)) {
    throw ApiError.unauthorized('Password was changed recently. Please log in again.');
  }

  req.user = user;
  next();
});

/** Role-based access control — usage: `authorize('admin', 'superadmin')`. */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized('Not authenticated.');
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(`Role "${req.user.role}" is not permitted to perform this action.`);
    }
    next();
  };
}

/** Attaches req.user if a valid token is present, but never rejects the request —
 * for endpoints that behave differently for guests vs logged-in users. */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (user && user.isActive) req.user = user;
  } catch {
    // Invalid/expired token on an optional-auth route — proceed as guest rather than erroring.
  }
  next();
});
