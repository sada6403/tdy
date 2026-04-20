const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  expenseDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
