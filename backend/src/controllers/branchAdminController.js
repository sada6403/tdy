const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { sendEmail } = require('../utils/emailService');

const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const generateUserId = (name, branchCode) => {
    const initials = name.trim().split(' ').map(w => w[0].toUpperCase()).join('').slice(0, 3);
    const num = Math.floor(100 + Math.random() * 900);
    return `BA-${branchCode || 'BR'}-${initials}${num}`;
};

exports.getBranchAdmins = async (req, res, next) => {
    try {
        const admins = await User.find({ role: 'BRANCH_ADMIN' })
            .populate('branchId', 'name city')
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: admins });
    } catch (error) {
        next(error);
    }
};

exports.createBranchAdmin = async (req, res, next) => {
    try {
        // Only super admin can create branch admins
        if (!req.user.isSuperAdmin && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only Super Admin can create branch admins.' });
        }

        const { name, email, phone, branchId } = req.body;
        if (!name || !email || !branchId) {
            return res.status(400).json({ success: false, message: 'Name, email and branch are required.' });
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already in use.' });
        }

        const Branch = require('../models/Branch');
        const branch = await Branch.findById(branchId);
        if (!branch) return res.status(404).json({ success: false, message: 'Branch not found.' });

        const rawPassword = generatePassword();
        const userId = generateUserId(name, branch.name?.slice(0, 3).toUpperCase() || 'BR');

        const admin = await User.create({
            name,
            email: email.toLowerCase().trim(),
            phone,
            userId,
            password: rawPassword,
            role: 'BRANCH_ADMIN',
            branchId,
            isSuperAdmin: false,
            isActive: true
        });

        // Send welcome email with credentials
        const emailHtml = `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
                <div style="text-align:center;margin-bottom:24px;">
                    <img src="https://nfplantation.lk/logo.jpg" alt="NF Plantation" style="height:60px;border-radius:8px;" onerror="this.style.display='none'" />
                    <h1 style="color:#0f172a;font-size:20px;margin-top:16px;">NF PLANTATION (PVT) LTD</h1>
                </div>
                <div style="background:white;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
                    <h2 style="color:#10b981;font-size:18px;margin-bottom:4px;">Welcome to the Admin Portal</h2>
                    <p style="color:#64748b;font-size:13px;margin-bottom:24px;">Your Branch Administrator account has been created by the Super Admin.</p>
                    <div style="background:#f1f5f9;border-radius:10px;padding:20px;margin-bottom:20px;">
                        <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Your Login Credentials</p>
                        <table style="width:100%;font-size:14px;">
                            <tr><td style="padding:6px 0;color:#64748b;font-weight:700;width:140px;">User ID</td><td style="font-weight:800;color:#0f172a;font-family:monospace;">${userId}</td></tr>
                            <tr><td style="padding:6px 0;color:#64748b;font-weight:700;">Temporary Password</td><td style="font-weight:800;color:#dc2626;font-family:monospace;">${rawPassword}</td></tr>
                            <tr><td style="padding:6px 0;color:#64748b;font-weight:700;">Assigned Branch</td><td style="font-weight:800;color:#0f172a;">${branch.name}</td></tr>
                        </table>
                    </div>
                    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px;font-size:12px;color:#92400e;">
                        ⚠️ Please log in and change your password immediately. This temporary password will expire in 48 hours.
                    </div>
                    <p style="margin-top:24px;font-size:12px;color:#94a3b8;text-align:center;">
                        NF Plantation Admin Portal — Restricted Access
                    </p>
                </div>
            </div>
        `;

        try {
            await sendEmail(email, 'Your NF Plantation Branch Admin Account', emailHtml);
        } catch (emailErr) {
            console.warn('[BRANCH_ADMIN] Email delivery failed:', emailErr.message);
        }

        AuditLog.create({
            userId: req.user._id,
            action: 'BRANCH_ADMIN_CREATED',
            target: 'USER',
            targetId: admin._id,
            description: `Branch admin ${name} created for ${branch.name} branch`,
            severity: 'INFO',
            ipAddress: req.ip
        }).catch(() => {});

        res.status(201).json({
            success: true,
            message: 'Branch admin created. Credentials sent to their email.',
            data: { id: admin._id, name, userId, email, branchId }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateBranchAdmin = async (req, res, next) => {
    try {
        if (!req.user.isSuperAdmin && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only Super Admin can update branch admins.' });
        }
        const { name, email, phone, branchId } = req.body;
        const admin = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'BRANCH_ADMIN' },
            { name, email, phone, branchId },
            { new: true }
        ).select('-password');
        if (!admin) return res.status(404).json({ success: false, message: 'Branch admin not found.' });
        res.json({ success: true, data: admin });
    } catch (error) {
        next(error);
    }
};

exports.toggleBranchAdminStatus = async (req, res, next) => {
    try {
        if (!req.user.isSuperAdmin && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only Super Admin can change admin status.' });
        }
        const admin = await User.findOne({ _id: req.params.id, role: 'BRANCH_ADMIN' });
        if (!admin) return res.status(404).json({ success: false, message: 'Branch admin not found.' });
        admin.isActive = !admin.isActive;
        await admin.save();
        res.json({ success: true, data: { isActive: admin.isActive } });
    } catch (error) {
        next(error);
    }
};

exports.deleteBranchAdmin = async (req, res, next) => {
    try {
        if (!req.user.isSuperAdmin && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only Super Admin can delete branch admins.' });
        }
        await User.findOneAndDelete({ _id: req.params.id, role: 'BRANCH_ADMIN' });
        res.json({ success: true, message: 'Branch admin removed.' });
    } catch (error) {
        next(error);
    }
};

exports.getRoleSummary = async (req, res, next) => {
    try {
        const [superAdminCount, branchAdminCount] = await Promise.all([
            User.countDocuments({ role: 'ADMIN' }),
            User.countDocuments({ role: 'BRANCH_ADMIN' })
        ]);
        res.json({ success: true, data: { superAdminCount, branchAdminCount } });
    } catch (error) {
        next(error);
    }
};

exports.getOnlineAdmins = async (req, res, next) => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const online = await User.find({
            role: { $in: ['ADMIN', 'BRANCH_ADMIN'] },
            lastSeen: { $gte: fiveMinutesAgo }
        }).select('name userId role branchId lastSeen').populate('branchId', 'name').lean();
        res.json({ success: true, data: online });
    } catch (error) {
        next(error);
    }
};
