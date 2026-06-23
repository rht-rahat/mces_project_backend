const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const dbHelper = require('../models/modelHelper');
const Notification = require('../models/Notification');
const { sendNotificationToAdmins } = require('./notifications');

// GET /api/appointments - Fetch all appointments (Admin Only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const list = await dbHelper.find(Appointment, 'appointments', {}, { createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error('Fetch appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/appointments/:id - Fetch single appointment (Admin Only)
router.get('/:id', auth, admin, async (req, res) => {
  try {
    const item = await dbHelper.findById(Appointment, 'appointments', req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Fetch appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/appointments - Create appointment (Public - from contact form)
router.post('/', async (req, res) => {
  const { name, email, phone, message, serviceName, date } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const appointment = await dbHelper.create(Appointment, 'appointments', {
      name,
      email,
      phone: phone || '',
      message: message || '',
      serviceName: serviceName || 'General Consultation',
      date: date || '',
      status: 'pending'
    });

    // Create notification for admin
    const detailMessage = `Appointment requested by ${name} (${phone || 'No phone'}) for service: ${serviceName || 'General Consultation'}. Info: ${message || ''}`;
    const notification = await dbHelper.create(Notification, 'notifications', {
      type: 'appointment',
      title: 'New Appointment Request',
      message: detailMessage
    });

    sendNotificationToAdmins(notification);

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/appointments/:id/status - Update appointment status (Admin Only)
router.patch('/:id/status', auth, admin, async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Must be pending, accepted, or rejected.' });
  }

  try {
    const updated = await dbHelper.findByIdAndUpdate(Appointment, 'appointments', req.params.id, { status });
    if (!updated) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/appointments/:id - Delete appointment (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const deleted = await dbHelper.findByIdAndDelete(Appointment, 'appointments', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
