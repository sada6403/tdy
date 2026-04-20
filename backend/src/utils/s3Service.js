const { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Multer S3 Storage Configuration
 * Stores files initially in the 'pending/' directory
 */
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const key = 'pending/applications/' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
            console.log(`[S3 Upload] Generated key: ${key}`);
            cb(null, key);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = new Set([
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/jfif',
            'application/pdf',
        ]);
        
        if (!allowedMimeTypes.has(file.mimetype)) {
            console.warn(`[MULTER] File upload rejected: ${file.originalname} (Mimetype: ${file.mimetype})`);
            return cb(new Error('Only JPEG, JPG, PNG, WEBP, and PDF files are allowed'));
        }
        cb(null, true);
    },
});

/**
 * Multer S3 Storage for Marketing Assets (Hero Banners, etc)
 */
const uploadMarketing = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const key = 'marketing/hero/' + uniqueSuffix + path.extname(file.originalname);
            cb(null, key);
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for high-res hero images
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
        if (!allowedMimeTypes.has(file.mimetype)) {
            return cb(new Error('Only JPEG, JPG, PNG, and WEBP images are allowed'));
        }
        cb(null, true);
    },
});

/**
 * Upload base64 string (signature) to S3
 */
const uploadSignatureToS3 = async (base64String, referenceId) => {
    if (!base64String || !base64String.startsWith('data:image')) return null;

    try {
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const type = base64String.split(';')[0].split('/')[1];
        
        // Signatures also start in pending
        const fileName = `pending/signatures/sig-${referenceId}-${Date.now()}.${type}`;
        
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: `image/${type}`,
        });

        await s3.send(command);
        console.log(`[S3 Signature] Successfully uploaded signature: ${fileName}`);
        return {
            url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
            key: fileName
        };
    } catch (error) {
        console.error('[S3 Signature Upload Error]', error);
        return null;
    }
};

/**
 * Move file from pending to verified folder in S3
 */
const finalizeS3File = async (oldKey) => {
    if (!oldKey) return null;
    
    const newKey = oldKey.replace('pending/', 'verified/');
    
    try {
        // 1. Copy to new location
        await s3.send(new CopyObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            CopySource: `${process.env.AWS_S3_BUCKET_NAME}/${oldKey}`,
            Key: newKey
        }));

        // 2. Delete old location
        await s3.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: oldKey
        }));

        return {
            url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`,
            key: newKey
        };
    } catch (error) {
        console.error('[S3 Finalize Error]', error);
        return null;
    }
};

/**
 * Fetch an S3 object (by URL or key) and return it as a base64 data URL.
 * This bypasses CORS entirely — the backend fetches from S3, frontend gets pure base64.
 * If the input is already base64, it is returned as-is.
 */
const getImageBase64FromS3 = async (urlOrKey) => {
    if (!urlOrKey) return null;
    // Already base64 — return directly
    if (urlOrKey.startsWith('data:')) return urlOrKey;

    // Extract S3 key from full URL
    let key = urlOrKey;
    try {
        const bucketDomain = `.s3.${process.env.AWS_REGION}.amazonaws.com/`;
        const idx = urlOrKey.indexOf(bucketDomain);
        if (idx !== -1) {
            key = urlOrKey.substring(idx + bucketDomain.length);
            // Strip query string if present (presigned URLs)
            const qIdx = key.indexOf('?');
            if (qIdx !== -1) key = key.substring(0, qIdx);
        } else if (urlOrKey.startsWith('http')) {
            // Unknown URL — cannot proxy, return null
            return null;
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        });
        const response = await s3.send(command);

        // Collect stream chunks
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const buffer = Buffer.concat(chunks);
        const contentType = response.ContentType || 'image/png';
        return `data:${contentType};base64,${buffer.toString('base64')}`;
    } catch (e) {
        console.error('[S3 Base64 Fetch Error]', e.message);
        return null;
    }
};

module.exports = {
    s3,
    upload,
    uploadMarketing,
    uploadSignatureToS3,
    finalizeS3File,
    getImageBase64FromS3
};
