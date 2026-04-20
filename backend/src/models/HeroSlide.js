const mongoose = require('mongoose');

const HeroSlideSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleHighlight: { type: String }, // For colored/emphasized title segment
  subtitle: { type: String, required: true },
  badgeText: { type: String }, // Small label at the top
  backgroundImage: { type: String, required: true },
  mobileImage: { type: String },
  primaryButtonText: { type: String, default: "Apply Now" },
  primaryButtonLink: { type: String, default: "/company/nf-plantation/login" },
  secondaryButtonText: { type: String, default: "View Plans" },
  secondaryButtonLink: { type: String, default: "/company/nf-plantation/investment-plans" },
  supportStripText: { type: String }, // Text shown in the scrolling strip or sub-hero
  trustLabel: { type: String }, // e.g. "100% Asset Backed"
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  animationEnabled: { type: Boolean, default: true },
  visualMode: { type: String, enum: ['standard', '3d', 'minimal'], default: 'standard' },
  accentColor: { type: String, default: 'emerald' }, // emerald, blue, etc.
  fontFamily: { type: String, default: 'Outfit' },
  titleStyle: { type: String, enum: ['normal', 'uppercase', 'italic', 'bold-italic'], default: 'uppercase' },
  titleWeight: { type: String, default: '900' },
  alignment: { type: String, enum: ['left', 'center'], default: 'left' },
  titleSize: { type: String, default: 'text-7xl' },
  subtitleSize: { type: String, default: 'text-xl' },
  titleColor: { type: String, default: '#ffffff' },
  subtitleColor: { type: String, default: '#ffffff' },
  highlightColor: { type: String, default: '#10b981' },
  buttonColor: { type: String, default: '#10b981' },
  motionType: { type: String, enum: ['fade', 'slide-up', 'zoom-in', 'none'], default: 'slide-up' },
  // Dashboard Stats (Investment Dashboard)
  statReturns: { type: String, default: "3-4%" },
  statInvestors: { type: String, default: "3,000+" },
  statSuccessRate: { type: String, default: "100%" },
  statTotalInvested: { type: String, default: "2Cr+" },
  // Loading Screen Advertisements
  advertisements: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('HeroSlide', HeroSlideSchema);
