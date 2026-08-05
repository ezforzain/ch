import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

/** Buffers the file in memory (never touches disk mid-request) so the same upload
 * handler can forward it to Cloudinary or write it locally — see utils/storeImage.js. */
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(ApiError.badRequest(`Unsupported file type "${file.mimetype}". Allowed: JPEG, PNG, WEBP, GIF, AVIF.`));
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});
