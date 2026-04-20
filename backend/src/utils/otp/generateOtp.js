const crypto = require('crypto');

/**
 * Generates a secure random 6-digit numeric OTP.
 */
const generateOtp = () => {
    // Generate a cryptographically secure random number between 100000 and 999999
    const val = crypto.randomInt(100000, 1000000);
    return val.toString();
};

module.exports = generateOtp;
