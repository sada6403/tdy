const Contact = require('../models/Contact');
const Notification = require('../models/Notification');

exports.submitContact = async (req, res) => {
    try {
        const { name, phone, email, subject, message, type } = req.body;

        if (!name || !phone || !message) {
            return res.status(400).json({ success: false, message: 'Please provide name, phone and message' });
        }

        const contact = await Contact.create({
            name,
            phone,
            email,
            subject,
            message,
            type: type || 'contact_page'
        });

        // Create notification for admin
        await Notification.create({
            title: 'New Contact Inquiry',
            message: `New message from ${name} (${phone}). Subject: ${subject || 'No Subject'}`,
            type: 'SYSTEM',
            targetType: 'ADMIN',
            metadata: {
                contactId: contact._id,
                source: 'contact_form'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully. Our team will contact you soon.',
            data: contact
        });
    } catch (err) {
        console.error('Contact submit error:', err);
        res.status(500).json({ success: false, message: 'Server Error. Please try again later.' });
    }
};

exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort('-createdAt');
        res.status(200).json({ success: true, data: contacts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.markRead = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, { isRead: true, status: 'READ' }, { new: true });
        if (!contact) return res.status(404).json({ success: false, message: 'Not Found' });
        res.status(200).json({ success: true, data: contact });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
