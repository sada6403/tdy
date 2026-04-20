const User = require('../../models/User');
const bcrypt = require('bcrypt');
const generateToken = require('../../utils/generateToken');

/**
 * Handles core user authentication logic.
 */
class AuthService {
    async login({ user_id, password }) {
        console.log(`[AuthService] Attempting login for user: ${user_id}`);
        const user = await User.findOne({ 
            $or: [{ userId: user_id }, { email: user_id }],
            isActive: true 
        });

        if (!user) {
            console.log(`[AuthService] User not found: ${user_id}`);
            throw new Error('Invalid Credentials');
        }

        console.log(`[AuthService] User found. Comparing password...`);
        const isMatch = await user.comparePassword(password);
        console.log(`[AuthService] Password match: ${isMatch}`);

        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            if (user.loginAttempts >= 5) {
                user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
                user.loginAttempts = 0;
            }
            await user.save();
            throw new Error('Invalid Credentials');
        }

        // Success
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
