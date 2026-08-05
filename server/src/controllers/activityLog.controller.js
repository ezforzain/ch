import { ActivityLog } from '../models/ActivityLog.js';
import * as factory from './handlerFactory.js';

export const getActivityLogs = factory.getAll(ActivityLog, { searchableFields: ['userName', 'module', 'action'] });
