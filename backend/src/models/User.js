const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  userId: { type: String, unique: true, sparse: true, index: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'BRANCH_ADMIN', 'CUSTOMER', 'STAFF'], required: true, default: 'STAFF' },
  isSuperAdmin: { type: Boolean, default: false },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
  isActive: { type: Boolean, default: true },
  loginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date },
  mustChangePassword: { type: Boolean, default: false },
  passwordChangedAt: { type: Date, default: null },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  photoUrl: { type: String, default: '' },
  lastSeen: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save hook to hash password
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to verify password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
