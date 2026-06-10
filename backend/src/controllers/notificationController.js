const Notification = require('../models/Notification');
const User = require('../models/User');
const Customer = require('../models/Customer');

exports.getMyNotifications = async (req, res, next) => {
    try {
        const user = req.user;
        
        // Priority 1: Use pre-fetched customer from middleware
        let customerId = req.customer?._id || user.customerId;
        
        // Priority 2: Fallback to lookup if middleware didn't catch it
        if (!customerId) {
            const customer = await Customer.findOne({ 
                $or: [
                    { email: user.email }, 
                    { mobile: user.phone } // User model uses 'phone', Customer uses 'mobile'
                ] 
            });
            if (customer) customerId = customer._id;
        }
        
        if (!customerId) {
            return res.json({ success: true, count: 0, data: [] });
        }

        const notifications = await Notification.find({
            $or: [
                { customerId: customerId },
                { targetType: 'ALL' }
            ]
        }).sort({ createdAt: -1 });
        res.json({ success: true, count: notifications.length, data: notifications });
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const customer = await Customer.findOne({ $or: [{ email: user.email }, { phone: user.phone }] });

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer record not found' });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, customerId: customer._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, message: 'Marked as read', data: notification });
    } catch (error) {
        next(error);
    }
};

exports.createNotification = async (req, res, next) => {
    try {
        const { targetType, targetId, customer_id, title, message, type } = req.body;

        // Support both legacy customer_id and new targetType/targetId params
        const recipientId = targetId || customer_id;
        const isAllBroadcast = targetType === 'ALL' || !recipientId || recipientId === 'ALL';

        if (isAllBroadcast) {
            // Store ONE record — no per-customer duplicates in admin view
            const notification = await Notification.create({
                customerId: null,
                targetType: 'ALL',
                title,
                message,
                type: type || 'INFO',
                sentByAdmin: true
            });
            return res.status(201).json({ success: true, message: 'Notification broadcasted to all customers', data: notification });
        } else {
            const notification = await Notification.create({
                customerId: recipientId,
                targetType: 'CUSTOMER',
                title,
                message,
                type: type || 'INFO',
                sentByAdmin: true
            });
            return res.status(201).json({ success: true, message: 'Notification sent to customer', data: notification });
        }
    } catch (error) {
        next(error);
    }
};

exports.getAllNotifications = async (req, res, next) => {
    try {
        // Only return admin-sent master records (no per-customer delivery duplicates)
        const results = await Notification.find({ sentByAdmin: true })
            .populate('customerId', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({ success: true, count: results.length, data: results });
    } catch (error) {
        next(error);
    }
};
