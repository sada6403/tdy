const jwt = require('jsonwebtoken');

const generateToken = (id, roleName) => {
    return jwt.sign({ id, role: roleName }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

module.exports = generateToken;
