const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['video', 'achievement', 'work', 'testimonial'], 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String }, // For video links or image links
  image: { type: String }, // For uploaded images or external URLs
  author: { type: String }, // For testimonials
  role: { type: String }, // For testimonials
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
