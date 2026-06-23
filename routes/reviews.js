const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const Review = require('../models/Review');
const dbHelper = require('../models/modelHelper');

// GET /api/reviews - Fetch all client reviews
router.get('/', async (req, res) => {
  try {
    const list = await dbHelper.find(Review, 'reviews', {}, { createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reviews - Add a client review (Admin Only)
router.post('/', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { clientName, clientRole, reviewText, rating } = req.body;
  const imageUrl = req.fileUrl;

  if (!clientName || !clientRole || !reviewText || !imageUrl) {
    return res.status(400).json({ error: 'All fields including client image are required' });
  }

  try {
    const review = await dbHelper.create(Review, 'reviews', {
      clientName,
      clientRole,
      reviewText,
      rating: rating ? parseInt(rating, 10) : 5,
      imageUrl
    });
    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/reviews/:id - Update review (Admin Only)
router.put('/:id', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { clientName, clientRole, reviewText, rating } = req.body;
  const updateFields = {};

  if (clientName) updateFields.clientName = clientName;
  if (clientRole) updateFields.clientRole = clientRole;
  if (reviewText) updateFields.reviewText = reviewText;
  if (rating !== undefined) updateFields.rating = parseInt(rating, 10);
  if (req.fileUrl) updateFields.imageUrl = req.fileUrl;

  try {
    const updated = await dbHelper.findByIdAndUpdate(Review, 'reviews', req.params.id, updateFields);
    if (!updated) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/reviews/:id - Delete review (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const deleted = await dbHelper.findByIdAndDelete(Review, 'reviews', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
