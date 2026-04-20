const mongoose = require('mongoose');

const websiteSettingSchema = new mongoose.Schema({
  contact: {
    email: { type: String, default: 'info@nfplantation.com' },
    phone: { type: String, default: '+94 11 234 5678' },
    address: { type: String, default: '123 Plantation Way, Colombo 03, Sri Lanka' },
    officeHours: { type: String, default: 'Mon-Fri: 9:00 AM - 5:00 PM' },
    mapIframe: { type: String, default: '' }
  },
  social: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  branding: {
    copyrightText: { type: String, default: '© 2026 NF Plantation. All Rights Reserved.' },
    companyName: { type: String, default: 'NF Plantation' }
  },
  mobileLinks: {
    appStore: { type: String, default: '' },
    googlePlay: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteSetting', websiteSettingSchema);
