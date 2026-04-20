const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, unique: true },
  totalBalance: { type: Number, default: 0, required: true },
  availableBalance: { type: Number, default: 0, required: true },
  heldBalance: { type: Number, default: 0, required: true },
  totalInvested: { type: Number, default: 0, required: true },
  totalEarned: { type: Number, default: 0, required: true },
  totalWithdrawn: { type: Number, default: 0, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', WalletSchema);
