const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Keeping actorId for backward compatibility if needed
    role: { type: String },
    action: { type: String, required: true, index: true },
    target: { type: String }, // e.g. 'WALLET', 'INVESTMENT'
    entityType: { type: String }, // Equivalent to target
    targetId: { type: mongoose.Schema.Types.ObjectId },
    entityId: { type: mongoose.Schema.Types.ObjectId }, // Equivalent to targetId
    oldData: { type: mongoose.Schema.Types.Mixed },
    newData: { type: mongoose.Schema.Types.Mixed },
    payload: { type: mongoose.Schema.Types.Mixed }, // Equivalent to newData often
    description: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    severity: { type: String, enum: ['INFO', 'WARN', 'CRITICAL'], default: 'INFO' }
}, { timestamps: true });

if (mongoose.models.AuditLog) {
    module.exports = mongoose.models.AuditLog;
} else {
    // In case there is an orphaned connection model
    delete mongoose.connection.models['AuditLog'];
    module.exports = mongoose.model('AuditLog', AuditLogSchema);
}
