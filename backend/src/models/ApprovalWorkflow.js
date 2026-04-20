const mongoose = require('mongoose');

const ApprovalWorkflowSchema = new mongoose.Schema({
  entityType: { type: String, required: true }, // e.g., 'DepositRequest', 'Withdrawal', 'PlanActivation'
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalWorkflow', ApprovalWorkflowSchema);
