const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  contact: { type: String, required: true },
  assignedCustomers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Agent', AgentSchema);
