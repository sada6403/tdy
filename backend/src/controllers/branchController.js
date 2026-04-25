const Branch = require('../models/Branch');
const Customer = require('../models/Customer');
const CustomerInvestment = require('../models/CustomerInvestment');

exports.getBranchStats = async (req, res, next) => {
    try {
        const [totalBranches, totalCustomers, investResult] = await Promise.all([
            Branch.countDocuments(),
            Customer.countDocuments({ isActive: true }),
            CustomerInvestment.aggregate([
                { $match: { status: 'ACTIVE' } },
                { $group: { _id: null, total: { $sum: '$investedAmount' } } }
            ])
        ]);

        const networkValue = investResult[0]?.total || 0;
        res.json({
            success: true,
            data: {
                totalBranches,
                totalCustomers,
                networkValueRaw: networkValue,
                networkValueFormatted: networkValue >= 1000000
                    ? `LKR ${(networkValue / 1000000).toFixed(1)}M`
                    : `LKR ${new Intl.NumberFormat('en-LK').format(networkValue)}`
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllBranches = async (req, res, next) => {
    try {
        const branches = await Branch.find().sort({ name: 1 }).lean();

        // Aggregate investment totals per branch via Customer.branchId
        const investByBranch = await CustomerInvestment.aggregate([
            { $match: { status: 'ACTIVE' } },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: { path: '$customer', preserveNullAndEmpty: false } },
            {
                $group: {
                    _id: '$customer.branchId',
                    totalInvestment: { $sum: '$investedAmount' },
                    investmentCount: { $sum: 1 }
                }
            }
        ]);

        // Customer counts per branch
        const customersByBranch = await Customer.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$branchId', count: { $sum: 1 } } }
        ]);

        const investMap = {};
        investByBranch.forEach(r => { if (r._id) investMap[r._id.toString()] = r; });

        const customerMap = {};
        customersByBranch.forEach(r => { if (r._id) customerMap[r._id.toString()] = r.count; });

        const enriched = branches.map(br => {
            const key = br._id.toString();
            const inv = investMap[key] || { totalInvestment: 0, investmentCount: 0 };
            return {
                ...br,
                investmentCount: inv.investmentCount,
                totalInvestment: inv.totalInvestment,
                totalInvestmentFormatted: inv.totalInvestment >= 1000000
                    ? `LKR ${(inv.totalInvestment / 1000000).toFixed(1)}M`
                    : `LKR ${new Intl.NumberFormat('en-LK').format(inv.totalInvestment)}`,
                customerCount: customerMap[key] || 0
            };
        });

        res.json({ success: true, count: enriched.length, data: enriched });
    } catch (error) {
        next(error);
    }
};

exports.createBranch = async (req, res, next) => {
    try {
        const { name, address, contactNumber, email, location, type, lat, lng, googleMapsUrl, managerName } = req.body;
        const photoUrl = req.file?.location || req.body.photoUrl || '';
        const branch = await Branch.create({
            name, address, contactNumber, email, location, type, lat, lng,
            googleMapsUrl, managerName, photoUrl
        });
        res.status(201).json({ success: true, data: branch });
    } catch (error) {
        next(error);
    }
};

exports.updateBranch = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, address, contactNumber, email, location, type, lat, lng, googleMapsUrl, managerName } = req.body;
        const updateData = { name, address, contactNumber, email, location, type, lat, lng, googleMapsUrl, managerName };
        if (req.file?.location) updateData.photoUrl = req.file.location;
        else if (req.body.photoUrl !== undefined) updateData.photoUrl = req.body.photoUrl;

        const branch = await Branch.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
        res.json({ success: true, data: branch });
    } catch (error) {
        next(error);
    }
};

exports.deleteBranch = async (req, res, next) => {
    try {
        const { id } = req.params;
        const branch = await Branch.findByIdAndDelete(id);
        if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
        res.json({ success: true, message: 'Branch deleted' });
    } catch (error) {
        next(error);
    }
};
