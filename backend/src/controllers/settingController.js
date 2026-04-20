const WebsiteSetting = require('../models/WebsiteSetting');

exports.getSettings = async (req, res, next) => {
    try {
        let settings = await WebsiteSetting.findOne();
        if (!settings) {
            settings = await WebsiteSetting.create({});
        }
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        next(error);
    }
};

exports.updateSettings = async (req, res, next) => {
    try {
        const { contact, social, branding, mobileLinks } = req.body;
        let settings = await WebsiteSetting.findOne();
        
        if (!settings) {
            settings = await WebsiteSetting.create({});
        }

        // Robust update logic for nested objects
        if (contact) {
            Object.keys(contact).forEach(key => {
                settings.contact[key] = contact[key];
            });
        }
        if (social) {
            Object.keys(social).forEach(key => {
                settings.social[key] = social[key];
            });
        }
        if (branding) {
            Object.keys(branding).forEach(key => {
                settings.branding[key] = branding[key];
            });
        }
        if (mobileLinks) {
            Object.keys(mobileLinks).forEach(key => {
                settings.mobileLinks[key] = mobileLinks[key];
            });
        }

        await settings.save();
        console.log('Website settings updated successfully');

        res.json({
            success: true,
            data: settings,
            message: 'Website settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        next(error);
    }
};
