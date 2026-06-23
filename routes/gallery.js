const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const Gallery = require('../models/Gallery');
const dbHelper = require('../models/modelHelper');

// GET /api/gallery - Fetch all gallery items (Public)
router.get('/', async (req, res) => {
  try {
    const list = await dbHelper.find(Gallery, 'galleries', {}, { createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error('Fetch gallery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gallery - Add gallery item (Admin Only)
router.post('/', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, description } = req.body;
  const imageUrl = req.fileUrl; // From handleUpload middleware

  if (!title || !imageUrl) {
    return res.status(400).json({ error: 'Title and image file are required' });
  }

  try {
    const item = await dbHelper.create(Gallery, 'galleries', {
      title,
      description: description || '',
      imageUrl
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Create gallery item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/gallery/:id - Update gallery item (Admin Only)
router.put('/:id', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const updateData = { title, description: description || '' };
    if (req.fileUrl) {
      updateData.imageUrl = req.fileUrl;
    }

    const updated = await dbHelper.findByIdAndUpdate(Gallery, 'galleries', req.params.id, updateData);
    if (!updated) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update gallery item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gallery/:id - Delete gallery item (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const deleted = await dbHelper.findByIdAndDelete(Gallery, 'galleries', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
