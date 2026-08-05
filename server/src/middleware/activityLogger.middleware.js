import { ActivityLog } from '../models/ActivityLog.js';

const ACTION_BY_METHOD = { POST: 'created', PATCH: 'updated', PUT: 'updated', DELETE: 'deleted' };
// Noisy/not-meaningful-as-a-CRUD-action modules to skip.
const SKIP_MODULES = new Set(['auth', 'uploads']);

/**
 * Records a lightweight audit trail entry for every successful authenticated
 * mutation, generically — avoids hand-adding a logActivity() call to 20+
 * controllers. Mounted early in app.js so it observes every route; reads
 * req.user off the same request object after route-level `protect` runs
 * (res 'finish' fires once the whole request lifecycle, including that
 * middleware, has completed).
 */
export function activityLogger(req, res, next) {
  const action = ACTION_BY_METHOD[req.method];
  if (!action) return next();

  res.on('finish', () => {
    if (res.statusCode >= 400 || !req.user) return;
    const segments = req.originalUrl.replace(/^\/api\/v1\//, '').split('?')[0].split('/').filter(Boolean);
    const moduleName = segments[0] || 'unknown';
    if (SKIP_MODULES.has(moduleName)) return;

    ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action,
      module: moduleName,
      targetId: segments[1] && segments[1] !== 'me' ? segments[1] : '',
      method: req.method,
      path: req.originalUrl,
    }).catch((err) => console.error('[activity-log] failed to record:', err.message));
  });

  next();
}
