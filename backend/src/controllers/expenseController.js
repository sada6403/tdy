const Expense = require('../models/Expense');

exports.getExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.find().sort({ expenseDate: -1, createdAt: -1 });
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);

        const summary = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: '$amount' },
                    thisMonth: {
                        $sum: {
                            $cond: [{ $gte: ['$expenseDate', startOfMonth] }, '$amount', 0]
                        }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: expenses,
            summary: {
                totalExpenses: summary[0]?.totalExpenses || 0,
                thisMonth: summary[0]?.thisMonth || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.createExpense = async (req, res, next) => {
    try {
        const { title, category, amount, expense_date } = req.body;
        const expense = await Expense.create({
            title,
            category,
            amount,
            expenseDate: expense_date || new Date()
        });
        res.status(201).json({ success: true, data: expense });
    } catch (error) {
        next(error);
    }
};

exports.getExpenseDistribution = async (req, res, next) => {
    try {
        const distribution = await Expense.aggregate([
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }
            },
            { $project: { category: '$_id', total: 1, _id: 0 } }
        ]);
        res.json({ success: true, data: distribution });
    } catch (error) {
        next(error);
    }
};
