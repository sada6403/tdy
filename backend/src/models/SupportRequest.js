const mongoose = require('mongoose');

const SupportRequestSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    customerName: { type: String },
    customerEmail: { type: String },
    customerPhone: { type: String },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['NEW', 'READ', 'IN_PROGRESS', 'RESOLVED'], default: 'NEW' },
    isRead: { type: Boolean, default: false },
    adminNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SupportRequest', SupportRequestSchema);
