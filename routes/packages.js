const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const Package = require('../models/Package');
const dbHelper = require('../models/modelHelper');

// GET /api/packages - Fetch all tour packages
router.get('/', async (req, res) => {
  try {
    const list = await dbHelper.find(Package, 'packages', {}, { createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error('Fetch packages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/packages/:id - Fetch single tour package
router.get('/:id', async (req, res) => {
  try {
    const item = await dbHelper.findById(Package, 'packages', req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Tour package not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Fetch package by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/packages - Create tour package (Admin Only)
router.post('/', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, destination, duration, price, description, itinerary } = req.body;
  const imageUrl = req.fileUrl;

  if (!title || !destination || !duration || !price || !description || !imageUrl) {
    return res.status(400).json({ error: 'All fields including image are required' });
  }

  try {
    // Parse itinerary if it is stringified JSON array
    let itineraryArray = [];
    if (itinerary) {
      try {
        itineraryArray = typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary;
      } catch (e) {
        itineraryArray = itinerary.split('\n').filter(Boolean); // fallback to newlines
      }
    }

    const packageItem = await dbHelper.create(Package, 'packages', {
      title,
      destination,
      duration,
      price: parseFloat(price),
      description,
      imageUrl,
      itinerary: itineraryArray
    });
    res.status(201).json(packageItem);
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/packages/:id - Update tour package (Admin Only)
router.put('/:id', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, destination, duration, price, description, itinerary } = req.body;
  const updateFields = {};

  if (title) updateFields.title = title;
  if (destination) updateFields.destination = destination;
  if (duration) updateFields.duration = duration;
  if (price !== undefined) updateFields.price = parseFloat(price);
  if (description) updateFields.description = description;
  if (req.fileUrl) updateFields.imageUrl = req.fileUrl;

  if (itinerary !== undefined) {
    try {
      updateFields.itinerary = typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary;
    } catch (e) {
      updateFields.itinerary = itinerary.split('\n').filter(Boolean);
    }
  }

  try {
    const updated = await dbHelper.findByIdAndUpdate(Package, 'packages', req.params.id, updateFields);
    if (!updated) {
      return res.status(404).json({ error: 'Tour package not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/packages/:id - Delete tour package (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const deleted = await dbHelper.findByIdAndDelete(Package, 'packages', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tour package not found' });
    }
    res.json({ message: 'Tour package deleted successfully' });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
