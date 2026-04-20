const mongoose = require('mongoose');

const ApplicationAddressSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  permanentAddress: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ApplicationAddress', ApplicationAddressSchema);
