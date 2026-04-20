const bcrypt = require('bcrypt');

/**
 * Hashes the OTP code before database storage.
 * @param {string} otp - The plain text OTP.
 * @returns {Promise<string>} - The hashed OTP.
 */
const hashOtp = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
};

/**
 * Compares plain OTP with hashed OTP.
 * @param {string} otp - Plain text OTP input.
 * @param {string} hash - Hashed OTP from database.
 * @returns {Promise<boolean>}
 */
const compareOtp = async (otp, hash) => {
    return await bcrypt.compare(otp, hash);
};

module.exports = { hashOtp, compareOtp };
