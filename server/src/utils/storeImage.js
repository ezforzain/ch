import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import cloudinary from '../config/cloudinary.js';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `chaudhary-electronics/${folder}`, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buffer);
  });
}

/** Stores one uploaded image (from multer memoryStorage) either on Cloudinary
 * (when CLOUDINARY_* env vars are set) or on local disk under /uploads, and
 * returns a uniform { url, publicId, provider } shape either way — callers
 * (controllers) never need to know which backend is active. */
export async function storeImage(file, folder = 'misc') {
  if (env.useCloudinary) {
    const result = await uploadBufferToCloudinary(file.buffer, folder);
    return { url: result.secure_url, publicId: result.public_id, provider: 'cloudinary' };
  }

  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${folder}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  const subDir = path.join(UPLOADS_DIR, folder);
  fs.mkdirSync(subDir, { recursive: true });
  fs.writeFileSync(path.join(subDir, filename), file.buffer);

  return { url: `/uploads/${folder}/${filename}`, publicId: `${folder}/${filename}`, provider: 'local' };
}

export async function storeImages(files, folder = 'misc') {
  return Promise.all(files.map((file) => storeImage(file, folder)));
}

/** Best-effort cleanup of a replaced/removed image — deliberately swallows every failure
 * (wrong provider inferred from data saved before `avatar.provider` existed, file already
 * gone, permissions, a transient Cloudinary error) because deleting the OLD file is
 * housekeeping, not the reason the caller's request exists. It must never be able to fail
 * the request that's replacing it with a new one. */
export async function deleteStoredImage({ publicId, provider } = {}) {
  if (!publicId) return;
  try {
    if (provider === 'cloudinary' && env.useCloudinary) {
      await cloudinary.uploader.destroy(publicId);
    } else {
      await fs.promises.unlink(path.join(UPLOADS_DIR, publicId));
    }
  } catch {
    // Ignored — see comment above.
  }
}
