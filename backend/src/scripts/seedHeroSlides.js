const mongoose = require('mongoose');
const HeroSlide = require('../models/HeroSlide');
require('dotenv').config();

const seedData = [
  {
    title: "Secure Deposits. Structured Returns.",
    titleHighlight: "Structured",
    subtitle: "NF Plantation is a premier financial investment organization providing high-yield deposit plans backed by large-scale agricultural assets and a nationwide branch network.",
    badgeText: "Institutional Stability",
    backgroundImage: "/images/nf_growth_chart_ad.png",
    primaryButtonText: "Apply Now",
    primaryButtonLink: "/company/nf-plantation/login",
    secondaryButtonText: "View Plans",
    secondaryButtonLink: "/company/nf-plantation/investment-plans",
    supportStripText: "Regulated by internal transparency protocols and asset-backed security.",
    trustLabel: "3.0% - 4.5% ROI",
    order: 1,
    isActive: true,
    accentColor: "emerald",
    statReturns: "3-4%",
    statInvestors: "3,000+",
    statSuccessRate: "100%",
    statTotalInvested: "2Cr+"
  },
  {
    title: "A Branch Near You. A Future For You.",
    titleHighlight: "Future",
    subtitle: "With local branches across the country, our field officers and assistant managers provide guided support to ensure your financial growth is managed professionally.",
    badgeText: "Local Presence",
    backgroundImage: "/images/nf_vip_card_ad.png",
    primaryButtonText: "Find Branch",
    primaryButtonLink: "/company/nf-plantation/contact",
    secondaryButtonText: "Our Story",
    secondaryButtonLink: "/company/nf-plantation/about",
    supportStripText: "Operated via Head Office, Zonal, and Regional Management hierarchy.",
    trustLabel: "Direct Support",
    order: 2,
    isActive: true,
    accentColor: "blue",
    statReturns: "2.5-3.5%",
    statInvestors: "5,000+",
    statSuccessRate: "99.8%",
    statTotalInvested: "5Cr+"
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing
    await HeroSlide.deleteMany({});
    console.log('Cleared existing HeroSlides');
    
    // Insert new
    await HeroSlide.insertMany(seedData);
    console.log('Seed data inserted successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seed();
