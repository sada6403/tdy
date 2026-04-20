const Agent = require('../models/Agent');
const Customer = require('../models/Customer');

exports.getAllAgents = async (req, res, next) => {
    try {
        const agents = await Agent.find().populate('branchId').sort({ name: 1 });
        res.json({ success: true, count: agents.length, data: agents });
    } catch (error) {
        next(error);
    }
};

exports.createAgent = async (req, res, next) => {
    try {
        const { name, branchId, contact } = req.body;
        const agent = await Agent.create({ name, branchId, contact });
        await agent.populate('branchId');
        res.status(201).json({ success: true, data: agent });
    } catch (error) {
        next(error);
    }
};

exports.deleteAgent = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Agent.findByIdAndDelete(id);
        res.json({ success: true, message: 'Agent deleted' });
    } catch (error) {
        next(error);
    }
};
