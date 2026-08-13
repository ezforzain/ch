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

  const secure = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure,
    // 'none' is required for the cookie to survive a cross-site request at all — and that's
    // exactly what every real deployment of this app is: the Vercel frontend and Render backend
    // are different registrable domains, and so is the Android app (served from Capacitor's own
    // `https://localhost`) talking to any real API host. Browsers only accept SameSite=None
    // over HTTPS, hence gating it on `secure` — in local dev (plain HTTP, same-site localhost
    // ports) 'lax' is both sufficient and the only option that actually works.
    sameSite: secure ? 'none' : 'lax',
    path: '/api/v1/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days — keep in sync with JWT_REFRESH_EXPIRES_IN default
  });

  return accessToken;
}
