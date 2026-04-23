const jwt = require('jsonwebtoken');

const generateToken = (id, roleName) => {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
        console.error('❌ JWT_SECRET is missing! Falling back to emergency key for debug.');
        // Note: In production, this should throw an error. 
        // We use a fallback here only to confirm if the app starts working.
        return jwt.sign({ id, role: roleName }, 'emergency_fallback_secret_2026', {
            expiresIn: process.env.JWT_EXPIRES_IN || '30d',
        });
    }

    return jwt.sign({ id, role: roleName }, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
};

module.exports = generateToken;
