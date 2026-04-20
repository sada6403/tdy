const mongoose = require('mongoose');

const IdempotencySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    response: { type: Object },
    status: { type: Number },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

IdempotencySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Idempotency', IdempotencySchema);
