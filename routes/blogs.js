const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadSingle, handleUpload } = require('../middleware/upload');
const Blog = require('../models/Blog');
const dbHelper = require('../models/modelHelper');

// GET /api/blogs - Fetch all blogs
router.get('/', async (req, res) => {
  try {
    const list = await dbHelper.find(Blog, 'blogs', {}, { createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error('Fetch blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/blogs/:id - Fetch single blog details
router.get('/:id', async (req, res) => {
  try {
    const blog = await dbHelper.findById(Blog, 'blogs', req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Fetch blog by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/blogs - Create blog post (Admin Only)
router.post('/', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, content, author } = req.body;
  const imageUrl = req.fileUrl;

  if (!title || !content || !imageUrl) {
    return res.status(400).json({ error: 'Title, content, and blog image are required' });
  }

  try {
    const blog = await dbHelper.create(Blog, 'blogs', {
      title,
      content,
      imageUrl,
      author: author || 'Admin'
    });
    res.status(201).json(blog);
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/blogs/:id - Update blog post (Admin Only)
router.put('/:id', auth, admin, uploadSingle, handleUpload, async (req, res) => {
  const { title, content, author } = req.body;
  const updateFields = {};

  if (title) updateFields.title = title;
  if (content) updateFields.content = content;
  if (author) updateFields.author = author;
  if (req.fileUrl) updateFields.imageUrl = req.fileUrl;

  try {
    const updated = await dbHelper.findByIdAndUpdate(Blog, 'blogs', req.params.id, updateFields);
    if (!updated) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/blogs/:id - Delete blog post (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const deleted = await dbHelper.findByIdAndDelete(Blog, 'blogs', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
