const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  contact: { type: String, required: true },
  email: { type: String, trim: true, lowercase: true },
  employeeId: { type: String, trim: true },
  designation: { type: String, trim: true, default: 'Field Agent' },
  department: { type: String, trim: true },
  nic: { type: String, trim: true, uppercase: true },
  address: { type: String, trim: true },
  dob: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
  hireDate: { type: Date },
  assignedCustomers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Agent', AgentSchema);
