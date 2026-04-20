const InvestmentPlan = require('../models/InvestmentPlan');
const CustomerInvestment = require('../models/CustomerInvestment');
const AuditLog = require('../models/AuditLog');

// Helper for audit logging
const logAction = async (req, action, targetId, oldData, newData, description) => {
    try {
        await AuditLog.create({
            userId: req.user?._id,
            actorId: req.user?._id,
            role: req.user?.role,
            action,
            target: 'INVESTMENT_PLAN',
            entityType: 'INVESTMENT_PLAN',
            targetId,
            entityId: targetId,
            oldData,
            newData,
            description,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });
    } catch (err) {
        console.error('Audit Log Error:', err);
    }
};

// @desc    Get only public visible active plans for customers
// @route   GET /api/customer/plans
exports.getPublicPlans = async (req, res, next) => {
    try {
        const plans = await InvestmentPlan.find({ 
            status: 'ACTIVE', 
            isActive: true, 
            customerVisible: true 
        }).sort({ displayOrder: 1, createdAt: -1 });

        res.json({ success: true, count: plans.length, data: plans });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all plans with admin summary
// @route   GET /api/admin/plans
exports.getAllPlans = async (req, res, next) => {
    try {
        const plans = await InvestmentPlan.find().sort({ createdAt: -1 });

        // Calculate Summary
        const summary = {
            totalPlans: plans.length,
            activeCount: plans.filter(p => p.status === 'ACTIVE').length,
            inactiveCount: plans.filter(p => p.status === 'INACTIVE').length,
            draftCount: plans.filter(p => p.status === 'DRAFT').length,
            averageInterest: plans.length > 0 
                ? (plans.reduce((s, p) => s + (p.status === 'ACTIVE' ? p.interestRate : 0), 0) / (plans.filter(p => p.status === 'ACTIVE').length || 1)).toFixed(2)
                : 0,
            minEntry: plans.length > 0
                ? Math.min(...plans.filter(p => p.status === 'ACTIVE').map(p => p.minAmount || Infinity))
                : 0
        };

        res.json({ success: true, summary, data: plans });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single plan for detail view
// @route   GET /api/admin/plans/:id
exports.getPlanById = async (req, res, next) => {
    try {
        const plan = await InvestmentPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.json({ success: true, data: plan });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new investment plan
// @route   POST /api/admin/plans
exports.createPlan = async (req, res, next) => {
    try {
        const plan = await InvestmentPlan.create(req.body);
        
        await logAction(req, 'PLAN_CREATED', plan._id, null, plan, `Created new investment plan: ${plan.name}`);
        
        res.status(201).json({ success: true, message: 'Investment plan created successfully', data: plan });
    } catch (error) {
        next(error);
    }
};

// @desc    Update investment plan
// @route   PUT /api/admin/plans/:id
exports.updatePlan = async (req, res, next) => {
    try {
        const oldPlan = await InvestmentPlan.findById(req.params.id);
        if (!oldPlan) return res.status(404).json({ success: false, message: 'Plan not found' });

        const plan = await InvestmentPlan.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, 
            runValidators: true 
        });

        await logAction(req, 'PLAN_UPDATED', plan._id, oldPlan, plan, `Updated investment plan: ${plan.name}`);

        res.json({ success: true, message: 'Investment plan updated successfully', data: plan });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle plan status (Active/Inactive)
// @route   PATCH /api/admin/plans/:id/status
exports.toggleStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const plan = await InvestmentPlan.findByIdAndUpdate(req.params.id, { 
            status,
            isActive: status === 'ACTIVE'
        }, { new: true });
        
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        await logAction(req, 'PLAN_STATUS_CHANGED', plan._id, null, { status }, `Changed plan status to ${status}`);

        res.json({ success: true, message: `Plan status changed to ${status}`, data: plan });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle customer visibility
// @route   PATCH /api/admin/plans/:id/visibility
exports.toggleVisibility = async (req, res, next) => {
    try {
        const { customerVisible } = req.body;
        const plan = await InvestmentPlan.findByIdAndUpdate(req.params.id, { customerVisible }, { new: true });
        
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        await logAction(req, 'PLAN_VISIBILITY_CHANGED', plan._id, null, { customerVisible }, `Changed customer visibility to ${customerVisible}`);

        res.json({ success: true, message: `Customer visibility set to ${customerVisible}`, data: plan });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete plan safely
// @route   DELETE /api/admin/plans/:id
exports.deletePlan = async (req, res, next) => {
    try {
        const id = req.params.id;
        
        // Check if plan is linked to any customer investments
        const usageCount = await CustomerInvestment.countDocuments({ planId: id });
        
        if (usageCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `This plan is currently in use by ${usageCount} active customer investments. Please deactivate it instead of deleting.` 
            });
        }

        const plan = await InvestmentPlan.findByIdAndDelete(id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        await logAction(req, 'PLAN_DELETED', id, plan, null, `Permanently deleted plan: ${plan.name}`);

        res.json({ success: true, message: 'Plan permanently removed from registry' });
    } catch (error) {
        next(error);
    }
};
