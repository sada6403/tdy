const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

app.set('trust proxy', 1);

// --- Rate Limiting (Banking Grade Protection) ---
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, // Limit for auth attempts
    message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

app.use(globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/registration/otp', authLimiter); // Protect OTP generation too

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
    frameguard: false, // Allow iframes for document preview
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
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));
app.use(morgan('dev'));

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
