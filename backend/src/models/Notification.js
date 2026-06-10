const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: false, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'], default: 'INFO' },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  targetType: { type: String, enum: ['ALL', 'CUSTOMER', 'SYSTEM'], default: 'CUSTOMER' },
  sentByAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
