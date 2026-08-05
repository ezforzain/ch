import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught exception:', err);
  process.exit(1);
});

async function main() {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`[server] Chaudhary Electronics API listening on http://localhost:${env.port}`);
    console.log(`[server] Environment: ${env.nodeEnv}`);
    console.log(`[server] Accepting requests from: ${env.clientUrl}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('[fatal] Unhandled promise rejection:', err);
    server.close(() => process.exit(1));
  });

  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received — shutting down gracefully…`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[fatal] Failed to start server:', err);
  process.exit(1);
});
