const jwt = require('jsonwebtoken');

const generateToken = (id, roleName) => {
    let secret = process.env.JWT_SECRET;
    
    if (!secret || secret.trim() === '') {
        console.error('❌ CRITICAL ERROR: JWT_SECRET is missing or empty in environment variables!');
        console.warn('⚠️ Using an emergency fallback secret for authentication. PLEASE FIX YOUR .env FILE!');
        secret = 'emergency_fallback_secret_2026_nf_plantation';
    }

    return jwt.sign({ id, role: roleName }, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
};

module.exports = generateToken;
