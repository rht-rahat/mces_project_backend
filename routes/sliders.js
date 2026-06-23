const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const Slider = require('../models/Slider');
const dbHelper = require('../models/modelHelper');

// GET /api/sliders - Fetch all slider banners
router.get('/', async (req, res) => {
  try {
    const list = await dbHelper.find(Slider, 'sliders', {}, { order: 1 });
    res.json(list);
  } catch (error) {
    console.error('Fetch sliders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sliders - Create slider banner (Admin Only)
router.post('/', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, subtitle, actionUrl, order } = req.body;
  const imageUrl = req.fileUrl; // From handleUpload middleware

  if (!title || !subtitle || !imageUrl) {
    return res.status(400).json({ error: 'Title, subtitle, and image are required' });
  }

  try {
    const slider = await dbHelper.create(Slider, 'sliders', {
      title,
      subtitle,
      imageUrl,
      actionUrl: actionUrl || '/',
      order: order ? parseInt(order, 10) : 0
    });
    res.status(201).json(slider);
  } catch (error) {
    console.error('Create slider error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/sliders/:id - Update slider banner (Admin Only)
router.put('/:id', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, subtitle, actionUrl, order } = req.body;
  const updateFields = {};

  if (title) updateFields.title = title;
  if (subtitle) updateFields.subtitle = subtitle;
  if (actionUrl) updateFields.actionUrl = actionUrl;
  if (order !== undefined) updateFields.order = parseInt(order, 10);
  if (req.fileUrl) updateFields.imageUrl = req.fileUrl;

  try {
    const updated = await dbHelper.findByIdAndUpdate(Slider, 'sliders', req.params.id, updateFields);
    if (!updated) {
      return res.status(404).json({ error: 'Slider banner not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update slider error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/sliders/:id - Delete slider banner (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const deleted = await dbHelper.findByIdAndDelete(Slider, 'sliders', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Slider banner not found' });
    }
    res.json({ message: 'Slider banner deleted successfully' });
  } catch (error) {
    console.error('Delete slider error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
