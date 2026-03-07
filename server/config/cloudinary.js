import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// ── Lazy configuration ────────────────────────────────────────────────────────
// ES modules hoist all imports before any code runs, so cloudinary.config()
// would fire before dotenv.config() if we called it at the top level.
// Instead we configure on first use, guaranteeing env vars are already loaded.
let _configured = false;
const ensureConfigured = () => {
  if (_configured) return;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      'Cloudinary env vars missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in your .env file.'
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  _configured = true;
};

// ── Multer — memory storage (no disk writes, buffer piped to Cloudinary) ─────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPG, PNG, WebP)'), false);
    }
  },
});

// ── Upload helper ─────────────────────────────────────────────────────────────
// Streams a Buffer to Cloudinary and resolves with { secure_url, public_id }
export const uploadToCloudinary = (buffer, folder = 'cineblood') => {
  ensureConfigured(); // configure here, not at import time
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [{ width: 1280, height: 720, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

// Export configured cloudinary instance (lazy-configures on first call too)
const cloudinaryProxy = new Proxy(cloudinary, {
  get(target, prop) {
    if (prop === 'uploader' || prop === 'api') ensureConfigured();
    return target[prop];
  },
});

export default cloudinaryProxy;