import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString(), tokenVersion: user.tokenVersion }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

/** Both tokens issued together on login/register/refresh; the refresh token is set as an
 * httpOnly cookie (see auth.controller.js) so it's never readable/stealable from JS, and the
 * access token is returned in the JSON body for the frontend to attach as a Bearer header. */
export function issueTokenPair(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days — keep in sync with JWT_REFRESH_EXPIRES_IN default
  });

  return accessToken;
}
