const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        trim: true
    },
    type: {
        type: String,
        default: 'contact_page'
    },
    status: {
        type: String,
        enum: ['NEW', 'READ', 'REPLIED', 'ARCHIVED'],
        default: 'NEW'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
