// Mirrors the server's multer fileFilter/limits for avatar uploads (see
// server/src/middleware/upload.middleware.js) so a bad file is rejected instantly in the
// browser instead of always round-tripping to the server first.

export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_AVATAR_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

/** Returns an error message if the file should be rejected, or '' if it's fine. */
export function validateAvatarFile(file) {
  if (!ALLOWED_AVATAR_MIME.has(file.type)) {
    return 'Unsupported file type. Please choose a JPEG, PNG, WEBP, GIF, or AVIF image.';
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return 'Image is too large. Please choose a file under 5 MB.';
  }
  return '';
}
