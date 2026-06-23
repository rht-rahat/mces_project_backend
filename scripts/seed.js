// One-time seed script for Vercel
// Run: node scripts/seed.js
// Or call GET /api/seed via browser after deployment

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connectDB } = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Package = require('../models/Package');
const Slider = require('../models/Slider');
const Review = require('../models/Review');

const seed = async () => {
  await connectDB();

  // Create admin
  const existing = await User.findOne({ email: 'admin@mces.com' });
  if (!existing) {
    const hashed = await bcrypt.hash('admin', 10);
    await User.create({ name: 'Admin', email: 'admin@mces.com', password: hashed, role: 'admin' });
    console.log('Admin user created');
  } else {
    console.log('Admin already exists');
  }

  process.exit(0);
};

seed();
