import crypto from 'node:crypto';
import asyncHandler from 'express-async-handler';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { issueTokenPair, signAccessToken, verifyRefreshToken } from '../utils/generateTokens.js';
import { sendEmail } from '../utils/sendEmail.js';
import { env } from '../config/env.js';

// @route  POST /api/v1/auth/register
// @access Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, businessName } = req.body;

  const existing = await User.findOne({ $or: [{ email }, ...(phone ? [{ phone }] : [])] });
  if (existing) throw ApiError.conflict('An account with this email or phone number already exists.');

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role === 'seller' ? 'seller' : 'customer',
    sellerProfile: role === 'seller' ? { businessName, status: 'pending' } : undefined,
  });

  const accessToken = issueTokenPair(res, user);
  sendResponse(res, 201, 'Account created successfully.', { user: user.toSafeJSON(), accessToken });
});

// @route  POST /api/v1/auth/login
// @access Public
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const isEmail = identifier.includes('@');

  const user = await User.findOne(isEmail ? { email: identifier.toLowerCase() } : { phone: identifier }).select(
    '+password',
  );
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Incorrect email/phone or password.');
  }
  if (!user.isActive) throw ApiError.forbidden('Your account has been deactivated. Contact an administrator.');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = issueTokenPair(res, user);
  sendResponse(res, 200, 'Logged in successfully.', { user: user.toSafeJSON(), accessToken });
});

// @route  POST /api/v1/auth/logout
// @access Public (clears whatever cookie is present)
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  sendResponse(res, 200, 'Logged out successfully.');
});

// @route  POST /api/v1/auth/refresh
// @access Public (requires the httpOnly refresh cookie)
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw ApiError.unauthorized('No refresh token — please log in again.');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Refresh token is invalid or expired — please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('Session is no longer valid — please log in again.');
  if (user.tokenVersion !== payload.tokenVersion) {
    throw ApiError.unauthorized('Session has been revoked — please log in again.');
  }

  const accessToken = signAccessToken(user);
  sendResponse(res, 200, 'Token refreshed.', { accessToken, user: user.toSafeJSON() });
});

// @route  GET /api/v1/auth/me
// @access Private
export const getMe = asyncHandler(async (req, res) => {
  sendResponse(res, 200, 'Current user fetched.', { user: req.user.toSafeJSON() });
});

// @route  PATCH /api/v1/auth/update-password
// @access Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) throw ApiError.badRequest('Current password is incorrect.');

  user.password = newPassword;
  user.tokenVersion += 1; // invalidate every other outstanding refresh token
  await user.save();

  const accessToken = issueTokenPair(res, user);
  sendResponse(res, 200, 'Password updated successfully.', { accessToken });
});

// @route  POST /api/v1/auth/forgot-password
// @access Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() });

  // Always respond the same way whether or not the account exists — avoids leaking
  // which emails are registered (a common account-enumeration vector).
  const genericMessage = 'If an account exists for that email, a password reset link has been sent.';
  if (!user) return sendResponse(res, 200, genericMessage);

  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Chaudhary Electronics password',
      text: `You requested a password reset. Click this link (valid for 30 minutes): ${resetUrl}\n\nIf you did not request this, ignore this email.`,
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a> (valid for 30 minutes).</p><p>If you did not request this, ignore this email.</p>`,
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw ApiError.internal('Could not send the reset email. Please try again later.');
  }

  sendResponse(res, 200, genericMessage);
});

// @route  POST /api/v1/auth/reset-password
// @access Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw ApiError.badRequest('Reset link is invalid or has expired.');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.tokenVersion += 1;
  await user.save();

  const accessToken = issueTokenPair(res, user);
  sendResponse(res, 200, 'Password reset successfully. You are now logged in.', { accessToken, user: user.toSafeJSON() });
});
