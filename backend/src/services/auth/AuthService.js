const User = require('../../models/User');
const bcrypt = require('bcrypt');
const generateToken = require('../../utils/generateToken');

/**
 * Handles core user authentication logic.
 */
class AuthService {
    async login({ user_id, password }) {
        const user = await User.findOne({
            $or: [{ userId: user_id }, { email: user_id }],
            isActive: true
        });

        if (!user) {
            throw new Error('Invalid Credentials');
        }

        // Enforce account lockout before checking password (prevents timing attacks)
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
            throw new Error(`Account locked. Try again in ${minutesLeft} minute(s).`);
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            if (user.loginAttempts >= 5) {
                user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
                user.loginAttempts = 0;
            }
            await user.save();
            throw new Error('Invalid Credentials');
        }

        // Success — clear lockout state
        user.loginAttempts = 0;
        user.lockoutUntil = undefined;
        await user.save();

        const token = generateToken(user._id, user.role);
        return { user, token };
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) throw new Error('Current password incorrect');

        user.password = newPassword;
        user.mustChangePassword = false;
        await user.save();
        return user;
    }
}

module.exports = new AuthService();
