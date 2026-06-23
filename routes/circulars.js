const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const Circular = require('../models/Circular');
const dbHelper = require('../models/modelHelper');

// GET /api/circulars - Fetch all circulars with dynamic filter support
router.get('/', async (req, res) => {
  const { country, jobCategory } = req.query;
  const filter = {};

  if (country) filter.country = country;
  if (jobCategory) filter.jobCategory = jobCategory;

  try {
    const list = await dbHelper.find(Circular, 'circulars', filter, { createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error('Fetch circulars error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/circulars/:id - Fetch single circular
router.get('/:id', async (req, res) => {
  try {
    const item = await dbHelper.findById(Circular, 'circulars', req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Circular not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Fetch circular by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/circulars - Create circular (Admin Only)
router.post('/', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, country, jobCategory, salaryRange, requirements } = req.body;
  const imageUrl = req.fileUrl;

  if (!title || !country || !jobCategory || !salaryRange || !imageUrl) {
    return res.status(400).json({ error: 'All fields including image are required' });
  }

  try {
    let requirementsArray = [];
    if (requirements) {
      try {
        requirementsArray = typeof requirements === 'string' ? JSON.parse(requirements) : requirements;
      } catch (e) {
        requirementsArray = requirements.split('\n').filter(Boolean);
      }
    }

    const circular = await dbHelper.create(Circular, 'circulars', {
      title,
      country,
      jobCategory,
      salaryRange,
      requirements: requirementsArray,
      imageUrl
    });
    res.status(201).json(circular);
  } catch (error) {
    console.error('Create circular error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/circulars/:id - Update circular (Admin Only)
router.put('/:id', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, country, jobCategory, salaryRange, requirements } = req.body;
  const updateFields = {};

  if (title) updateFields.title = title;
  if (country) updateFields.country = country;
  if (jobCategory) updateFields.jobCategory = jobCategory;
  if (salaryRange) updateFields.salaryRange = salaryRange;
  if (req.fileUrl) updateFields.imageUrl = req.fileUrl;

  if (requirements !== undefined) {
    try {
      updateFields.requirements = typeof requirements === 'string' ? JSON.parse(requirements) : requirements;
    } catch (e) {
      updateFields.requirements = requirements.split('\n').filter(Boolean);
    }
  }

  try {
    const updated = await dbHelper.findByIdAndUpdate(Circular, 'circulars', req.params.id, updateFields);
    if (!updated) {
      return res.status(404).json({ error: 'Circular not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update circular error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/circulars/:id - Delete circular (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const deleted = await dbHelper.findByIdAndDelete(Circular, 'circulars', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Circular not found' });
    }
    res.json({ message: 'Circular deleted successfully' });
  } catch (error) {
    console.error('Delete circular error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
