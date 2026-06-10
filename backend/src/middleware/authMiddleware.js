const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');
require('dotenv').config();

const protect = async (req, res, next) => {
    let token = req.cookies.nf_token;

    // Backward compatibility for Bearer tokens if needed
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select('-passwordHash');
            if (!user) {
                res.status(401);
                return next(new Error('Not authorized, user not found'));
            }

            // Standardize request user
            req.user = user;

            // Track last seen (non-blocking)
            User.updateOne({ _id: user._id }, { lastSeen: new Date() }).catch(() => {});

            // Pre-fetch customer profile for controllers if role is CUSTOMER
            if (user.role === 'CUSTOMER' && user.customerId) {
                const customer = await Customer.findById(user.customerId);
                req.customer = customer;
            }

            next();
        } catch (error) {
            res.status(401);
            return next(new Error('Not authorized, token failed'));
        }
    } else {
        res.status(401);
        return next(new Error('Not authorized, no token'));
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.status(403);
            return next(new Error(`User role ${req.user.role} is not authorized to access this route`));
        }
        next();
    };
};

module.exports = { protect, authorize };
