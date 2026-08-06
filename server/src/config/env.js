import dotenv from 'dotenv';

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // Fail fast at boot rather than mysteriously later (e.g. signing JWTs with "undefined").
    throw new Error(`Missing required environment variable: ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  // CLIENT_URL may be a single origin or a comma-separated list (e.g. your production
  // Vercel domain + a known preview URL + localhost for dev) — see config/cors.js.
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),

  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/chaudhary_electronics'),

  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // "Sign in with Google" verifies an ID token client-side obtained via Google Identity
  // Services — only the OAuth Client ID is needed here (it's not secret, just identifies
  // the app; it's the same value the frontend uses as VITE_GOOGLE_CLIENT_ID). No Client
  // Secret is involved anywhere in this flow.
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  get useGoogleAuth() {
    return Boolean(this.googleClientId);
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  get useCloudinary() {
    return Boolean(this.cloudinary.cloudName && this.cloudinary.apiKey && this.cloudinary.apiSecret);
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Chaudhary Electronics <no-reply@chaudharyelectronics.pk>',
  },
  get useSmtp() {
    return Boolean(this.smtp.host && this.smtp.user && this.smtp.pass);
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 300,
  },
};
