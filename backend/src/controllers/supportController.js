const SupportRequest = require('../models/SupportRequest');
const AdminNotification = require('../models/AdminNotification');
const Customer = require('../models/Customer');

// ──────────────────────────────────────────────
// CUSTOMER: Submit a support request
// ──────────────────────────────────────────────
exports.submitSupportRequest = async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ success: false, message: 'Subject and message are required.' });
        }

        const customer = await Customer.findById(req.customer._id);

        const request = await SupportRequest.create({
            customerId: req.customer._id,
            customerName: customer?.fullName || req.user?.name || 'Customer',
            customerEmail: customer?.email || req.user?.email || '',
            customerPhone: customer?.mobile || '',
            subject,
            message,
        });

        // Notify admin
        await AdminNotification.create({
            title: `New Support Request: ${subject}`,
            message: `${customer?.fullName || 'A customer'} submitted a support request: "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`,
            type: 'SUPPORT',
            referenceId: request._id,
            referenceType: 'SUPPORT_REQUEST',
        });

        res.json({ success: true, message: 'Your request has been submitted. We will respond shortly.' });
    } catch (error) {
        console.error('[SUPPORT] submitSupportRequest:', error.message);
        res.status(500).json({ success: false, message: 'Failed to submit request. Please try again.' });
    }
};

// ──────────────────────────────────────────────
// ADMIN: Get all support requests
// ──────────────────────────────────────────────
exports.getSupportRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = status ? { status } : {};

        const [requests, total, unreadCount] = await Promise.all([
            SupportRequest.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .lean(),
            SupportRequest.countDocuments(query),
            SupportRequest.countDocuments({ isRead: false }),
        ]);

        res.json({ success: true, data: requests, total, unreadCount });
    } catch (error) {
        console.error('[SUPPORT] getSupportRequests:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch requests.' });
    }
};

// ──────────────────────────────────────────────
// ADMIN: Update support request status
// ──────────────────────────────────────────────
exports.updateSupportStatus = async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        const update = { status };
        if (adminNote !== undefined) update.adminNote = adminNote;
        if (status !== 'NEW') update.isRead = true;

        const request = await SupportRequest.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

        res.json({ success: true, data: request });
    } catch (error) {
        console.error('[SUPPORT] updateSupportStatus:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update status.' });
    }
};

// ──────────────────────────────────────────────
// ADMIN: Mark request as read
// ──────────────────────────────────────────────
exports.markSupportRead = async (req, res) => {
    try {
        const request = await SupportRequest.findByIdAndUpdate(
            req.params.id,
            { isRead: true, status: 'READ' },
            { new: true }
        );
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
        res.json({ success: true, data: request });
    } catch (error) {
        console.error('[SUPPORT] markSupportRead:', error.message);
        res.status(500).json({ success: false, message: 'Failed to mark as read.' });
    }
};

// ──────────────────────────────────────────────
// ADMIN: Get admin notifications (bell)
// ──────────────────────────────────────────────
exports.getAdminNotifications = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const notifications = await AdminNotification.find()
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .lean();
        const unreadCount = await AdminNotification.countDocuments({ isRead: false });
        res.json({ success: true, data: notifications, unreadCount });
    } catch (error) {
        console.error('[SUPPORT] getAdminNotifications:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
    }
};

// ──────────────────────────────────────────────
// ADMIN: Mark admin notification as read
// ──────────────────────────────────────────────
exports.markAdminNotificationRead = async (req, res) => {
    try {
        await AdminNotification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to mark as read.' });
    }
};

// ADMIN: Mark ALL admin notifications as read
exports.markAllAdminNotificationsRead = async (req, res) => {
    try {
        await AdminNotification.updateMany({ isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
    }
};
