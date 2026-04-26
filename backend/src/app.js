const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
} else {
    console.log(`✅ Environment variables loaded successfully (${Object.keys(result.parsed || {}).length} variables)`);
}

// Critical Environment Check
const criticalEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'PORT'];
criticalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`🚨 CRITICAL ERROR: Environment variable ${varName} is missing!`);
    }
});

const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

app.set('trust proxy', 1);

// --- Gzip compression (reduces bandwidth ~70% for JSON responses) ---
app.use(compression());

// --- Rate Limiting (Banking Grade) ---
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300, // 300 req / 15 min per IP (was 1000 — too permissive)
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

app.use(globalLimiter);
app.use('/api/auth/login', authLimiter);
// OTP send + verify on ALL channels must be rate-limited
app.use('/api/registration/send-otp', authLimiter);
app.use('/api/registration/verify-otp', authLimiter);
app.use('/api/auth/forgot-password/send-otp', authLimiter);

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Basic CSP — allows own domain and CDN fonts; tighten further in production
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // needed for React in-app scripts
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'"],
            frameAncestors: ["'none'"], // prevent clickjacking
            objectSrc: ["'none'"],
        },
    },
    frameguard: { action: 'deny' }, // prevent clickjacking
    hsts: { maxAge: 31536000, includeSubDomains: true }, // force HTTPS for 1 year
}));
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://nfplantation.com',
        'https://admin.nfplantation.com',
        'https://www.nfplantation.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
}));
app.use(cookieParser());
// JSON body limit kept small — file uploads use multer which bypasses this limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Static folder for file uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Public Routes
app.use('/api/auth', authRoutes);

// Customer Routes
app.use('/api/customer', customerRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);

// Application Routes
app.use('/api/applications', applicationRoutes);
app.use('/api/registration', registrationRoutes);

// Publicly Accessible Content
app.use('/api/public', publicRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
