const mongoose = require('mongoose');

const AdminNotificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['SUPPORT', 'SYSTEM', 'INFO', 'WARNING'], default: 'INFO' },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    referenceType: { type: String },
    isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true });

module.exports = mongoose.model('AdminNotification', AdminNotificationSchema);
