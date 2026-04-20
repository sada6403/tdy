const Branch = require('../models/Branch');

exports.getAllBranches = async (req, res, next) => {
    try {
        const branches = await Branch.find().sort({ name: 1 });
        res.json({ success: true, count: branches.length, data: branches });
    } catch (error) {
        next(error);
    }
};

exports.createBranch = async (req, res, next) => {
    try {
        const { name, address, city, state, phone, manager } = req.body;
        const branch = await Branch.create({
            name, address, city, state, phone, manager
        });
        res.status(201).json({ success: true, data: branch });
    } catch (error) {
        next(error);
    }
};

exports.deleteBranch = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Branch.findByIdAndDelete(id);
        res.json({ success: true, message: 'Branch deleted' });
    } catch (error) {
        next(error);
    }
};
