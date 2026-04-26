const jwt = require('jsonwebtoken');

const generateToken = (id, roleName) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        // SECURITY: Never fall back to a known secret — fail hard.
        console.error('❌ FATAL: JWT_SECRET is not set. Refusing to issue token with fallback.');
        throw new Error('Server misconfiguration: JWT_SECRET is missing.');
    }

    return jwt.sign({ id, role: roleName }, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

module.exports = generateToken;
