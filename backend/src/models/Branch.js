const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: false },
  email: { type: String, required: false },
  location: { type: String, required: false },
  type: { type: String, enum: ['Main Office', 'Branch'], default: 'Branch' },
  lat: { type: Number, required: false },
  lng: { type: Number, required: false },
  googleMapsUrl: { type: String, default: '' },
  managerName: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Branch', BranchSchema);
