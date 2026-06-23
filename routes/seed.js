const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// GET /api/seed - Create admin user if not exists (one-time setup for Vercel)
router.get('/', async (req, res) => {
  try {
    const existing = await User.findOne({ email: 'admin@mces.com' });
    if (!existing) {
      const hashed = await bcrypt.hash('admin', 10);
      await User.create({ name: 'Admin', email: 'admin@mces.com', password: hashed, role: 'admin' });
      res.json({ message: 'Admin user created successfully' });
    } else {
      res.json({ message: 'Admin user already exists' });
    }
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Seed failed' });
  }
});

module.exports = router;
