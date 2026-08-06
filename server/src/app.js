import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';

import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFound } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { activityLogger } from './middleware/activityLogger.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // allow the frontend to load /uploads images
const LOCALHOST_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(
  cors({
    // Explicit allowlist (CLIENT_URL, comma-separated) rather than a wildcard — this API
    // accepts an httpOnly credentialed cookie (the refresh token), so a permissive origin
    // match would let any third-party site ride a logged-in user's session. In development
    // only, any localhost/127.0.0.1 port is also allowed — Vite silently jumps to 5174, 5175…
    // when 5173 is taken, and a strict single-port allowlist there just breaks every
    // authenticated request with an opaque CORS failure instead of anything actionable.
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
      if (env.nodeEnv !== 'production' && LOCALHOST_ORIGIN_RE.test(origin)) return callback(null, true);
      callback(new Error(`CORS: origin "${origin}" is not in CLIENT_URL`));
    },
    credentials: true, // required so the httpOnly refresh-token cookie is sent/received
  }),
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips `$`/`.` operators from req.body/query/params — blocks NoSQL injection

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
}

app.use('/api', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => res.json({ success: true, message: 'ok', uptime: process.uptime() }));
app.use(activityLogger);
app.use('/api/v1', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
