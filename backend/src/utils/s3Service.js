const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.join(__dirname, '../../uploads');

const getBaseUrl = () => process.env.BASE_URL || 'http://localhost:5000';

/**
 * Custom multer storage engine that writes to local disk while
 * exposing the same file.key / file.location interface as multer-s3.
 */
class VPSStorage {
    constructor(opts) {
        this._getKey = opts.key;
    }

    _handleFile(req, file, cb) {
        this._getKey(req, file, (err, key) => {
            if (err) return cb(err);
            const fullPath = path.join(UPLOADS_DIR, key);
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            const outStream = fs.createWriteStream(fullPath);
            file.stream.pipe(outStream);
            outStream.on('error', cb);
            outStream.on('finish', () => {
                cb(null, {
                    key,
                    location: `${getBaseUrl()}/uploads/${key}`,
                    path: fullPath,
                    size: outStream.bytesWritten
                });
            });
        });
    }

    _removeFile(req, file, cb) {
        const fullPath = path.join(UPLOADS_DIR, file.key);
        fs.unlink(fullPath, (err) => {
            if (err && err.code !== 'ENOENT') return cb(err);
            cb(null);
        });
    }
}

/**
 * Multer storage for application documents — pending/applications/
 */
const upload = multer({
    storage: new VPSStorage({
        key: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const key = `pending/applications/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
            console.log(`[VPS Upload] Generated key: ${key}`);
            cb(null, key);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = new Set([
            'image/jpeg', 'image/jpg', 'image/png',
            'image/webp', 'image/jfif', 'application/pdf'
        ]);
        if (!allowed.has(file.mimetype)) {
            console.warn(`[MULTER] File upload rejected: ${file.originalname} (Mimetype: ${file.mimetype})`);
            return cb(new Error('Only JPEG, JPG, PNG, WEBP, and PDF files are allowed'));
        }
        cb(null, true);
    }
});

/**
 * Multer storage for marketing assets — marketing/hero/
 */
const uploadMarketing = multer({
    storage: new VPSStorage({
        key: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const key = `marketing/hero/${uniqueSuffix}${path.extname(file.originalname)}`;
            cb(null, key);
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
        if (!allowed.has(file.mimetype)) {
            return cb(new Error('Only JPEG, JPG, PNG, and WEBP images are allowed'));
        }
        cb(null, true);
    }
});

/**
 * Extract relative storage key from a URL or return as-is if already a key.
 * Handles VPS URLs (http://server/uploads/key) and legacy S3 URLs.
 */
const extractKey = (urlOrKey) => {
    if (!urlOrKey || typeof urlOrKey !== 'string') return urlOrKey;
    if (!urlOrKey.startsWith('http')) return urlOrKey; // already a relative key
    // VPS URL: http://server/uploads/pending/...
    const uploadsIdx = urlOrKey.indexOf('/uploads/');
    if (uploadsIdx !== -1) return urlOrKey.substring(uploadsIdx + '/uploads/'.length);
    // Legacy S3 URL: https://bucket.s3.region.amazonaws.com/key
    const s3Idx = urlOrKey.indexOf('.amazonaws.com/');
    if (s3Idx !== -1) {
        const key = urlOrKey.substring(s3Idx + '.amazonaws.com/'.length);
        return key.split('?')[0];
    }
    return urlOrKey;
};

/**
 * Upload a base64 signature string to local disk.
 */
const uploadSignatureToS3 = async (base64String, referenceId) => {
    if (!base64String || !base64String.startsWith('data:image')) return null;
    try {
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const type = base64String.split(';')[0].split('/')[1];
        const key = `pending/signatures/sig-${referenceId}-${Date.now()}.${type}`;
        const fullPath = path.join(UPLOADS_DIR, key);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, buffer);
        console.log(`[VPS Signature] Saved: ${key}`);
        return {
            url: `${getBaseUrl()}/uploads/${key}`,
            key
        };
    } catch (error) {
        console.error('[VPS Signature Upload Error]', error);
        return null;
    }
};

/**
 * Move a file from pending/ to verified/ on local disk.
 */
const finalizeS3File = async (oldKey) => {
    if (!oldKey) return null;
    const resolvedKey = extractKey(oldKey);
    if (!resolvedKey || !resolvedKey.startsWith('pending/')) return null;

    const newKey = resolvedKey.replace('pending/', 'verified/');
    const oldPath = path.join(UPLOADS_DIR, resolvedKey);
    const newPath = path.join(UPLOADS_DIR, newKey);

    try {
        fs.mkdirSync(path.dirname(newPath), { recursive: true });
        fs.renameSync(oldPath, newPath);
        return {
            url: `${getBaseUrl()}/uploads/${newKey}`,
            key: newKey
        };
    } catch (error) {
        console.error('[VPS Finalize Error]', error.message);
        try {
            fs.copyFileSync(oldPath, newPath);
            fs.unlinkSync(oldPath);
            return {
                url: `${getBaseUrl()}/uploads/${newKey}`,
                key: newKey
            };
        } catch (err2) {
            console.error('[VPS Finalize Copy Error]', err2.message);
            return null;
        }
    }
};

/**
 * Read a local file and return it as a base64 data URL.
 * Accepts full VPS URLs, legacy S3 URLs, or relative keys.
 * Returns the value unchanged if it is already base64.
 */
const getImageBase64FromS3 = async (urlOrKey) => {
    if (!urlOrKey) return null;
    if (urlOrKey.startsWith('data:')) return urlOrKey;

    const key = extractKey(urlOrKey);
    if (!key || key.startsWith('http')) return null;

    try {
        const fullPath = path.join(UPLOADS_DIR, key);
        const buffer = fs.readFileSync(fullPath);
        const ext = path.extname(key).toLowerCase().slice(1);
        const mimeMap = {
            jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
            webp: 'image/webp', jfif: 'image/jpeg', pdf: 'application/pdf'
        };
        const contentType = mimeMap[ext] || 'image/png';
        return `data:${contentType};base64,${buffer.toString('base64')}`;
    } catch (e) {
        console.error('[VPS Base64 Read Error]', e.message);
        return null;
    }
};

const uploadBranch = multer({
    storage: new VPSStorage({
        key: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const key = `branches/${uniqueSuffix}${path.extname(file.originalname)}`;
            cb(null, key);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
        if (!allowed.has(file.mimetype)) return cb(new Error('Only JPEG, PNG, and WEBP allowed'));
        cb(null, true);
    },
});

module.exports = {
    s3: null, // No S3 client — kept for import compatibility
    upload,
    uploadMarketing,
    uploadBranch,
    uploadSignatureToS3,
    finalizeS3File,
    getImageBase64FromS3,
    extractKey,
    UPLOADS_DIR,
    getBaseUrl
};
