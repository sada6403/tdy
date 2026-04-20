const mongoose = require('mongoose');

const ApplicationDocumentSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  documentType: { 
    type: String, 
    required: true,
    enum: ['nicFront', 'nicBack', 'photo', 'bankProof', 'other']
  },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  s3Key: { type: String },
  isPermanent: { type: Boolean, default: false },
  mimeType: { type: String },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ApplicationDocument', ApplicationDocumentSchema);
