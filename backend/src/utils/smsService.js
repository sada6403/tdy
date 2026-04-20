const axios = require('axios');

const sendSms = async ({ phone, text }) => {
    try {
        // 1. IMPROVED PHONE FORMATTING
        // If phone starts with 0, replace with 94 (e.g., 0771234567 -> 94771234567)
        // If it's 9 digits, add 94 (e.g., 771234567 -> 94771234567)
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '94' + formattedPhone.substring(1);
        } else if (formattedPhone.length === 9) {
            formattedPhone = '94' + formattedPhone;
        }

        const url = process.env.SMS_API_URL || 'https://msmsenterpriseapi.mobitel.lk/EnterpriseSMSV3/esmsproxy.php';
        const username = process.env.SMS_USERNAME;
        const password = process.env.SMS_PASSWORD;
        const sender = process.env.MOBITEL_SENDER_ID ? process.env.MOBITEL_SENDER_ID.replace(/"/g, '') : null;

        // 2. MOBITEL DOCUMENTED PARAMETERS (Single Letter Keys)
        // u = username, p = password, r = recipient, m = message, a = alias, t = type
        const params = {
            u: username,
            p: password,
            r: formattedPhone,
            m: text,
            t: 0 // 0 for Non-Promotional (OTP/Internal), 1 for Promotional
        };

        // Add alias (sender mask) only if it exists
        if (sender) {
            params.a = sender;
        }

        console.info(`[SMS] Attempting to send SMS to ${formattedPhone} via Mobitel...`);
        const response = await axios.get(url, { params });

        console.info(`[SMS] Mobitel Response Status: ${response.status}`);
        if (process.env.NODE_ENV !== 'production') {
            console.info(`[SMS] Provider Response Body:`, response.data);
        }

        return { success: true, data: response.data };
    } catch (error) {
        console.error('[SMS Service Error]', error.message);
        throw error; // Or handle gracefully
    }
};

module.exports = { sendSms };
