const HeroSlide = require('../models/HeroSlide');

// Public: Get all active hero slides
exports.getPublicSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 });
    res.json({
      success: true,
      data: slides
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Manage slides
exports.getSlidesAdmin = async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });
    res.json({ success: true, data: slides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSlide = async (req, res) => {
  try {
    const slide = new HeroSlide(req.body);
    await slide.save();
    res.status(201).json({ success: true, data: slide });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });
    res.json({ success: true, data: slide });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });
    res.json({ success: true, message: 'Slide deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({
      success: true,
      url: req.file.location,
      key: req.file.key
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
